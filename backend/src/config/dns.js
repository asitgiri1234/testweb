/**
 * Node.js on Windows (v22+) can fail mongodb+srv SRV lookups with querySrv ECONNREFUSED
 * even when nslookup works. Use public DNS resolvers before any MongoDB connection.
 */
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");
