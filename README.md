[![progress-banner](https://backend.codecrafters.io/progress/dns-server/68bf69cb-152a-4cf0-9e64-773f571e2311)](https://app.codecrafters.io/users/DawidGawronskiDev?r=2qF)

# DNS server in TypeScript

My solution to the CodeCrafters
["Build Your Own DNS server" Challenge](https://app.codecrafters.io/courses/dns-server/overview),
written in TypeScript and run with [Bun](https://bun.sh). No runtime
dependencies — just `dgram` and raw `Buffer` manipulation. Everything lives in
`app/main.ts`.

## What it does

- Listens for DNS queries over UDP on `127.0.0.1:2053`
- Parses the header and question section, including multiple questions per
  packet and compressed names (pointer labels)
- Builds the response by hand: echoes the packet ID, `OPCODE` and `RD`, sets
  `QR = 1`, and returns `RCODE = 4` (Not Implemented) for any non-standard
  opcode
- **Standalone mode**: answers every question with an `A` record pointing to
  `8.8.8.8` (TTL 60)
- **Forwarding mode**: with `--resolver <ip>:<port>`, sends each question to the
  upstream resolver as a separate single-question query and merges the answers
  into one response

## Running

Requires `bun` 1.3.

```sh
bun install

# standalone: every name resolves to 8.8.8.8
./your_program.sh

# forward to an upstream resolver
./your_program.sh --resolver 8.8.8.8:53
```

Query it with `dig`:

```sh
dig @127.0.0.1 -p 2053 +noedns codecrafters.io
```

## Limitations

- Only `A` / `IN` questions; the query's `QTYPE` and `QCLASS` are not read
- `ANCOUNT` in forwarding mode is the number of upstream replies, so it is only
  correct when the resolver returns exactly one record per question
- No timeout or retry on upstream queries
- UDP only, no EDNS, no caching

## Submitting

```sh
codecrafters submit
```
