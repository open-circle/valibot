# Zod to Valibot Codemod

Official codemod for automatically converting Zod schemas to Valibot schemas.

## Usage

```bash
npx @valibot/zod-to-valibot src/**/*
```

## Options

```bash
# Dry run (preview changes)
npx @valibot/zod-to-valibot --dry src/**/*

# Verbose output
npx @valibot/zod-to-valibot --verbose=2 src/**/*

# Use a different parser (default is --parser=ts)
npx @valibot/zod-to-valibot --parser=babel src/**/*

# Use different extensions (default is --extensions=ts,tsx,js,jsx)
npx @valibot/zod-to-valibot --extensions=ts src/**/*
```

For all available options, see [jscodeshift documentation](https://github.com/facebook/jscodeshift#options).

## What Gets Converted

The codemod converts Zod schemas to Valibot, including:

- Basic schemas (`string`, `number`, `boolean`, `date`, `bigint`)
- Validation rules (`email`, `min`, `max`, etc.)
- Coercion (`z.coerce.*` → `v.pipe(v.unknown(), v.toX())`)
- Objects, arrays, unions, optionals, and more

## Support

For issues or questions, open an issue on the [Valibot repository](https://github.com/open-circle/valibot).
