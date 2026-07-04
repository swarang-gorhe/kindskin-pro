-- Enable pgvector and create knowledge base table for RAG chatbot
create extension if not exists vector;

create table if not exists kb_entries (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

create index if not exists kb_entries_embedding_idx
  on kb_entries using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RPC for semantic search (used by async retrieval)
create or replace function match_kb_entries(
  query_embedding vector(1536),
  match_threshold float default 0.72,
  match_count int default 5
)
returns table (
  id text,
  category text,
  question text,
  answer text,
  similarity float
)
language sql stable
as $$
  select
    kb_entries.id,
    kb_entries.category,
    kb_entries.question,
    kb_entries.answer,
    1 - (kb_entries.embedding <=> query_embedding) as similarity
  from kb_entries
  where kb_entries.embedding is not null
    and 1 - (kb_entries.embedding <=> query_embedding) > match_threshold
  order by kb_entries.embedding <=> query_embedding
  limit match_count;
$$;
