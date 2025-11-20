// Knowledge Graph - Similarity Calculation and Relationship Building
// Based on OpenAI embeddings and semantic similarity

import { openai } from './openai';
import { query } from '@/lib/db';

interface NoteEmbedding {
  note_id: string;
  embedding: number[];
  title: string;
  content: string;
}

interface SimilarNote {
  note_id: string;
  title: string;
  similarity: number;
  relationship_type: 'similar' | 'references' | 'builds_on';
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Generate embedding for a note's content
 */
export async function generateNoteEmbedding(
  noteId: string,
  title: string,
  content: string
): Promise<void> {
  try {
    // Combine title and content for embedding
    const text = `${title}\n\n${content}`.slice(0, 8000); // Limit to prevent API errors

    // Generate embedding using OpenAI
    const embedding = await openai.createEmbedding(text);

    // Store in database
    await query(
      `INSERT INTO note_embeddings (note_id, embedding, model)
       VALUES ($1, $2, $3)
       ON CONFLICT (note_id) DO UPDATE
       SET embedding = $2, model = $3, updated_at = CURRENT_TIMESTAMP`,
      [noteId, JSON.stringify(embedding), 'text-embedding-3-small']
    );

    console.log(`Generated embedding for note ${noteId}`);
  } catch (error) {
    console.error('Error generating note embedding:', error);
    throw error;
  }
}

/**
 * Find similar notes based on embedding similarity
 */
export async function findSimilarNotes(
  noteId: string,
  userId: string,
  options: {
    minSimilarity?: number;
    limit?: number;
    excludeNoteIds?: string[];
  } = {}
): Promise<SimilarNote[]> {
  const {
    minSimilarity = 0.7,
    limit = 10,
    excludeNoteIds = [],
  } = options;

  try {
    // Get the source note's embedding
    const sourceResult = await query(
      'SELECT embedding FROM note_embeddings WHERE note_id = $1',
      [noteId]
    );

    if (sourceResult.rows.length === 0) {
      throw new Error('Source note embedding not found');
    }

    const sourceEmbedding = JSON.parse(sourceResult.rows[0].embedding);

    // Get all other note embeddings for this user
    const candidatesResult = await query(
      `SELECT ne.note_id, ne.embedding, n.title, n.content
       FROM note_embeddings ne
       INNER JOIN notes n ON ne.note_id = n.id
       WHERE n.user_id = $1
       AND ne.note_id != $2
       AND ne.note_id != ALL($3)`,
      [userId, noteId, excludeNoteIds]
    );

    // Calculate similarity for each candidate
    const similarities: SimilarNote[] = [];

    for (const row of candidatesResult.rows) {
      const candidateEmbedding = JSON.parse(row.embedding);
      const similarity = cosineSimilarity(sourceEmbedding, candidateEmbedding);

      if (similarity >= minSimilarity) {
        // Determine relationship type based on similarity score
        let relationshipType: 'similar' | 'references' | 'builds_on' = 'similar';
        if (similarity >= 0.9) {
          relationshipType = 'builds_on';
        } else if (similarity >= 0.8) {
          relationshipType = 'references';
        }

        similarities.push({
          note_id: row.note_id,
          title: row.title,
          similarity,
          relationship_type: relationshipType,
        });
      }
    }

    // Sort by similarity and limit results
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, limit);
  } catch (error) {
    console.error('Error finding similar notes:', error);
    throw error;
  }
}

/**
 * Build relationships for a note
 */
export async function buildNoteRelationships(
  noteId: string,
  userId: string
): Promise<number> {
  try {
    // Find similar notes
    const similarNotes = await findSimilarNotes(noteId, userId, {
      minSimilarity: 0.6, // Lower threshold for relationship building
      limit: 20,
    });

    let relationshipsCreated = 0;

    // Create relationships in database
    for (const similar of similarNotes) {
      await query(
        `INSERT INTO note_relationships (
          source_note_id,
          target_note_id,
          relationship_type,
          strength,
          auto_generated
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (source_note_id, target_note_id) DO UPDATE
        SET strength = $4, relationship_type = $3, updated_at = CURRENT_TIMESTAMP`,
        [
          noteId,
          similar.note_id,
          similar.relationship_type,
          similar.similarity,
          true,
        ]
      );

      relationshipsCreated++;
    }

    console.log(`Created ${relationshipsCreated} relationships for note ${noteId}`);
    return relationshipsCreated;
  } catch (error) {
    console.error('Error building note relationships:', error);
    throw error;
  }
}

/**
 * Rebuild entire knowledge graph for a user
 */
export async function rebuildUserKnowledgeGraph(userId: string): Promise<{
  notesProcessed: number;
  relationshipsCreated: number;
  timeElapsed: number;
}> {
  const startTime = Date.now();
  let notesProcessed = 0;
  let totalRelationships = 0;

  try {
    // Get all notes for user
    const notesResult = await query(
      'SELECT id, title, content FROM notes WHERE user_id = $1',
      [userId]
    );

    const notes = notesResult.rows;

    // Process each note
    for (const note of notes) {
      // Generate embedding if not exists
      const embeddingExists = await query(
        'SELECT 1 FROM note_embeddings WHERE note_id = $1',
        [note.id]
      );

      if (embeddingExists.rows.length === 0) {
        await generateNoteEmbedding(note.id, note.title, note.content || '');
      }

      // Build relationships
      const relationships = await buildNoteRelationships(note.id, userId);
      totalRelationships += relationships;
      notesProcessed++;
    }

    // Calculate graph statistics
    await query('SELECT calculate_graph_stats($1)', [userId]);

    const timeElapsed = Date.now() - startTime;

    return {
      notesProcessed,
      relationshipsCreated: totalRelationships,
      timeElapsed,
    };
  } catch (error) {
    console.error('Error rebuilding knowledge graph:', error);
    throw error;
  }
}

/**
 * Get graph data for visualization
 */
export async function getKnowledgeGraphData(
  userId: string,
  options: {
    limit?: number;
    minStrength?: number;
  } = {}
): Promise<{
  nodes: Array<{ id: string; title: string; type: string; size: number }>;
  edges: Array<{
    source: string;
    target: string;
    strength: number;
    type: string;
  }>;
  stats: {
    totalNodes: number;
    totalEdges: number;
    avgConnections: number;
  };
}> {
  const { limit = 100, minStrength = 0.5 } = options;

  try {
    // Get nodes (notes)
    const nodesResult = await query(
      `SELECT
        n.id,
        n.title,
        n.type,
        COUNT(r.id) as connection_count
       FROM notes n
       LEFT JOIN note_relationships r ON (n.id = r.source_note_id OR n.id = r.target_note_id)
       WHERE n.user_id = $1
       GROUP BY n.id, n.title, n.type
       ORDER BY connection_count DESC
       LIMIT $2`,
      [userId, limit]
    );

    const nodeIds = nodesResult.rows.map((n) => n.id);

    // Get edges (relationships) between these nodes
    const edgesResult = await query(
      `SELECT
        source_note_id,
        target_note_id,
        relationship_type,
        strength
       FROM note_relationships
       WHERE source_note_id = ANY($1)
       AND target_note_id = ANY($1)
       AND strength >= $2
       ORDER BY strength DESC`,
      [nodeIds, minStrength]
    );

    // Get graph stats
    const statsResult = await query(
      'SELECT * FROM graph_metadata WHERE user_id = $1',
      [userId]
    );

    const stats = statsResult.rows[0] || {
      total_nodes: 0,
      total_edges: 0,
      avg_connections_per_note: 0,
    };

    return {
      nodes: nodesResult.rows.map((node) => ({
        id: node.id,
        title: node.title,
        type: node.type,
        size: node.connection_count,
      })),
      edges: edgesResult.rows.map((edge) => ({
        source: edge.source_note_id,
        target: edge.target_note_id,
        strength: edge.strength,
        type: edge.relationship_type,
      })),
      stats: {
        totalNodes: stats.total_nodes,
        totalEdges: stats.total_edges,
        avgConnections: stats.avg_connections_per_note,
      },
    };
  } catch (error) {
    console.error('Error getting knowledge graph data:', error);
    throw error;
  }
}

/**
 * Create manual relationship between notes
 */
export async function createManualRelationship(
  sourceNoteId: string,
  targetNoteId: string,
  relationshipType: string = 'manual',
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await query(
      `INSERT INTO note_relationships (
        source_note_id,
        target_note_id,
        relationship_type,
        strength,
        auto_generated,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (source_note_id, target_note_id) DO UPDATE
      SET relationship_type = $3, auto_generated = $5, metadata = $6`,
      [sourceNoteId, targetNoteId, relationshipType, 1.0, false, JSON.stringify(metadata)]
    );

    console.log(`Created manual relationship: ${sourceNoteId} -> ${targetNoteId}`);
  } catch (error) {
    console.error('Error creating manual relationship:', error);
    throw error;
  }
}
