import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Transport that starts the server as a child process
const transport = new StdioClientTransport({
  // Use node to run the compiled server javascript file
  command: "node",
  args: ["dist/server.js"]
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  }
);

async function main() {
  try {
    console.log("Connecting to server...");
    await client.connect(transport);
    console.log("Server connected.");

    // Call the 'add' tool
    const a = 10;
    const b = 23;
    console.log(`Calling 'add' tool with arguments: { a: ${a}, b: ${b} }`);
    const result = await client.callTool({
      name: "add",
      arguments: { a, b }
    });

    console.log("Tool call result:", result);

  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // The transport will automatically handle process cleanup
  }
}

main();