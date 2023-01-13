# dmem

## Init
```bash

# Create the KV namespaces
wrangler kv:namespace create "DMEM"
wrangler kv:namespace create "DMEM" --preview
```

## Testing
```bash
wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

