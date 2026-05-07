# Multiple Host Pattern Setup Example

## How to Configure Both `*.csnonprod.com` and `localhost`

When you first open the extension, you'll see the setup dialog. Here's how to configure multiple host patterns:

### Step-by-Step Setup

1. **Fill in Parameter Details:**
   - Parameter Key: `enableRollbacks`
   - Parameter Value: `true`

2. **Configure First Host Pattern:**
   - The dialog starts with one host pattern row
   - Host Pattern: `*.csnonprod.com`
   - Routing Type: `Hash-based`

3. **Add Second Host Pattern:**
   - Click the "+ Add Host Pattern" button
   - In the new row:
     - Host Pattern: `localhost`
     - Routing Type: `Path-based`

4. **Add More if Needed:**
   - You can continue clicking "+ Add Host Pattern" to add more hosts
   - Each host can have its own routing type
   - Use the "×" button to remove any host you don't need

5. **Save Configuration:**
   - Click "Save & Continue"
   - The extension will save both host patterns with their respective routing types

### Result

After setup, your configuration will be:

```javascript
{
  params: [{ key: "enableRollbacks", value: "true" }],
  hosts: [
    { pattern: "*.csnonprod.com", routing: "hash" },
    { pattern: "localhost", routing: "path" }
  ]
}
```

### What This Means

- **On `*.csnonprod.com` sites**: The parameter `enableRollbacks=true` will be added to the hash (e.g., `#/page?enableRollbacks=true`)
- **On `localhost`**: The parameter `enableRollbacks=true` will be added to the URL query string (e.g., `?enableRollbacks=true`)

### Popup Display

After setup, your popup will show:

**Active Params:**
- `enableRollbacks=true`

**Target Hosts:**
- `*.csnonprod.com (hash)` - shown in blue
- `localhost (path)` - shown in green

### Testing

1. Visit any site matching `*.csnonprod.com` (like `app.csnonprod.com`)
2. Visit `localhost` (any port)
3. The extension should automatically inject the parameter using the correct routing method for each host

## Advanced Examples

You can configure even more host patterns:

```
enableRollbacks=true

Hosts:
- *.csnonprod.com (hash-based)
- localhost (path-based)
- staging.myapp.com (path-based)
- *.contentstack.com (hash-based)
- dev.example.com (path-based)
```

The extension will work correctly across all these different environments!