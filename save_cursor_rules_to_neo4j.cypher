// Save Cursor Rules to Neo4j Knowledge Graph
// Run this script once Neo4j authentication is working

// Create main CursorRules node
CREATE (cr:CursorRules {
  id: "cursor-rules-apptivity-v1",
  title: "Clerk Authentication Rules for Next.js App",
  project: "Apptivity Final v1",
  created_at: datetime(),
  updated_at: datetime()
})

// Create Authentication Flow rules
CREATE (af:Rule:AuthenticationFlow {
  id: "auth-flow-rules",
  category: "Authentication Flow",
  rules: [
    "Always use Clerk's built-in components for sign-in/sign-up flows",
    "Use useUser() hook to access current user data",
    "Use useAuth() hook for authentication state and methods",
    "Implement proper loading states while authentication is being checked"
  ]
})

// Create User Management rules
CREATE (um:Rule:UserManagement {
  id: "user-management-rules",
  category: "User Management",
  rules: [
    "Always check user.id exists before making database operations",
    "Use Clerk's user.id as the primary identifier for database relations",
    "Handle user creation/profile setup in middleware or API routes",
    "Never expose sensitive user data in client-side code"
  ]
})

// Create Route Protection rules
CREATE (rp:Rule:RouteProtection {
  id: "route-protection-rules",
  category: "Route Protection",
  rules: [
    "Use Clerk's middleware for route protection",
    "Implement proper redirects for unauthenticated users",
    "Use auth() in API routes for server-side authentication",
    "Always validate user permissions before database operations"
  ]
})

// Create Environment Variables rules
CREATE (ev:Rule:EnvironmentVariables {
  id: "env-vars-rules",
  category: "Environment Variables",
  rules: [
    "Keep all Clerk keys in environment variables",
    "Use NEXT_PUBLIC_ prefix only for publishable keys",
    "Never commit secret keys to version control",
    "Ensure all Clerk env vars are set in production"
  ]
})

// Create Error Handling rules
CREATE (eh:Rule:ErrorHandling {
  id: "error-handling-rules",
  category: "Error Handling",
  rules: [
    "Implement proper error boundaries for authentication failures",
    "Handle network errors gracefully in auth flows",
    "Provide clear user feedback for authentication issues",
    "Log authentication errors for debugging"
  ]
})

// Create Database Integration rules
CREATE (di:Rule:DatabaseIntegration {
  id: "database-integration-rules",
  category: "Database Integration",
  rules: [
    "Always normalize Clerk user IDs for database storage",
    "Create user profiles automatically on first sign-in",
    "Handle user deletion/deactivation properly",
    "Sync user data changes from Clerk webhooks when needed"
  ]
})

// Create Development Workflow rules
CREATE (dw:Rule:DevelopmentWorkflow {
  id: "dev-workflow-rules",
  category: "Development Workflow",
  rules: [
    "Test authentication flows in both development and production",
    "Verify all protected routes work correctly",
    "Test sign-out functionality thoroughly",
    "Ensure proper cleanup of user sessions"
  ]
})

// Create TypeScript rules
CREATE (ts:Rule:TypeScript {
  id: "typescript-rules",
  category: "TypeScript",
  rules: [
    "Always use proper TypeScript types for Clerk objects",
    "Define interfaces for user profile data",
    "Use strict type checking for authentication states"
  ]
})

// Create Error Prevention rules
CREATE (ep:Rule:ErrorPrevention {
  id: "error-prevention-rules",
  category: "Error Prevention",
  rules: [
    "Always check for user existence before database operations",
    "Handle async authentication operations properly",
    "Implement proper loading states for auth-dependent components",
    "Use try-catch blocks for authentication API calls"
  ]
})

// Create Performance rules
CREATE (perf:Rule:Performance {
  id: "performance-rules",
  category: "Performance",
  rules: [
    "Minimize re-renders caused by authentication state changes",
    "Use proper dependency arrays in useEffect hooks",
    "Implement proper caching for user data",
    "Avoid unnecessary API calls for user information"
  ]
})

// Create Code Examples
CREATE (ce1:CodeExample {
  id: "user-profile-creation-example",
  title: "User Profile Creation",
  language: "typescript",
  code: "// Always ensure user profile exists\nconst ensureUserProfile = async (clerkUserId: string) => {\n  // Check if profile exists, create if not\n  // Use normalized user ID for database operations\n}"
})

CREATE (ce2:CodeExample {
  id: "protected-api-routes-example",
  title: "Protected API Routes",
  language: "typescript",
  code: "// Always authenticate API routes\nexport async function GET() {\n  const { userId } = auth()\n  if (!userId) {\n    return new Response('Unauthorized', { status: 401 })\n  }\n  // Continue with authenticated logic\n}"
})

CREATE (ce3:CodeExample {
  id: "client-side-protection-example",
  title: "Client-Side Protection",
  language: "typescript",
  code: "// Use proper loading states\nconst { isLoaded, isSignedIn, user } = useUser()\n\nif (!isLoaded) return <LoadingSpinner />\nif (!isSignedIn) return <SignInPrompt />\n// Continue with authenticated component"
})

// Create Build and Deployment rules
CREATE (bd:Rule:BuildDeployment {
  id: "build-deployment-rules",
  category: "Build and Deployment",
  rules: [
    "Always test authentication in production environment",
    "Verify all environment variables are properly set",
    "Test sign-in/sign-out flows after deployment",
    "Monitor authentication errors in production logs"
  ]
})

// Create relationships
WITH 1 as dummy
MATCH (cr:CursorRules {id: "cursor-rules-apptivity-v1"})
MATCH (af:Rule:AuthenticationFlow), (um:Rule:UserManagement), (rp:Rule:RouteProtection), 
      (ev:Rule:EnvironmentVariables), (eh:Rule:ErrorHandling), (di:Rule:DatabaseIntegration),
      (dw:Rule:DevelopmentWorkflow), (ts:Rule:TypeScript), (ep:Rule:ErrorPrevention),
      (perf:Rule:Performance), (bd:Rule:BuildDeployment)

CREATE (cr)-[:CONTAINS_RULE]->(af),
       (cr)-[:CONTAINS_RULE]->(um),
       (cr)-[:CONTAINS_RULE]->(rp),
       (cr)-[:CONTAINS_RULE]->(ev),
       (cr)-[:CONTAINS_RULE]->(eh),
       (cr)-[:CONTAINS_RULE]->(di),
       (cr)-[:CONTAINS_RULE]->(dw),
       (cr)-[:CONTAINS_RULE]->(ts),
       (cr)-[:CONTAINS_RULE]->(ep),
       (cr)-[:CONTAINS_RULE]->(perf),
       (cr)-[:CONTAINS_RULE]->(bd)

// Link code examples to relevant rules
WITH 1 as dummy
MATCH (cr:CursorRules {id: "cursor-rules-apptivity-v1"})
MATCH (ce1:CodeExample {id: "user-profile-creation-example"}),
      (ce2:CodeExample {id: "protected-api-routes-example"}),
      (ce3:CodeExample {id: "client-side-protection-example"})

CREATE (cr)-[:HAS_EXAMPLE]->(ce1),
       (cr)-[:HAS_EXAMPLE]->(ce2),
       (cr)-[:HAS_EXAMPLE]->(ce3)

// Create relationships between related rules
WITH 1 as dummy
MATCH (af:Rule:AuthenticationFlow), (um:Rule:UserManagement), (rp:Rule:RouteProtection)
CREATE (af)-[:RELATES_TO]->(um),
       (af)-[:RELATES_TO]->(rp),
       (um)-[:RELATES_TO]->(rp)

WITH 1 as dummy
MATCH (ts:Rule:TypeScript), (ep:Rule:ErrorPrevention)
CREATE (ts)-[:SUPPORTS]->(ep)

WITH 1 as dummy
MATCH (perf:Rule:Performance), (ep:Rule:ErrorPrevention)
CREATE (perf)-[:COMPLEMENTS]->(ep)

// Return summary
WITH 1 as dummy
MATCH (cr:CursorRules)-[:CONTAINS_RULE]->(r:Rule)
RETURN cr.title as CursorRulesTitle, 
       count(r) as TotalRules,
       collect(r.category) as RuleCategories 