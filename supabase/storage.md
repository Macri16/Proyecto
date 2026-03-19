# Supabase Storage setup (client-files)

## Bucket
- Create a bucket named `client-files`
- Recommended: **Private** bucket (access via signed URLs from backend)

## Suggested folder layout
- `global/*` files for all clients
- `users/<userId>/*` files per user

## Access model used by this project
- The frontend never reads Storage directly.
- The backend endpoint `GET /api/downloads` generates **signed URLs** using the Supabase **service role** key.

This keeps the Storage rules simple, and centralizes authorization in your backend.

