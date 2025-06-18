(()=>{var e={};e.id=2089,e.ids=[2089],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},70226:(e,r,a)=>{"use strict";a.r(r),a.d(r,{patchFetch:()=>l,routeModule:()=>p,serverHooks:()=>E,workAsyncStorage:()=>k,workUnitAsyncStorage:()=>u});var s={};a.r(s),a.d(s,{POST:()=>d});var t=a(96559),o=a(48088),i=a(37719),n=a(32190);async function d(){try{console.log("Setting up bookmark relationships database...");let e={code:"42P01"};if(!e)return n.NextResponse.json({success:!0,message:"Bookmark relationships table already exists and is ready!",tableExists:!0});if("42P01"!==e.code)return console.error("Unexpected error checking table:",e),n.NextResponse.json({success:!1,message:"Error checking table existence",error:"Simulated check error"},{status:500});let r=`
-- Create bookmark_relationships table for Clerk + Supabase
CREATE TABLE IF NOT EXISTS bookmark_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE NOT NULL,
    related_bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT DEFAULT 'related' CHECK (relationship_type IN ('related', 'similar', 'dependency', 'reference')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(bookmark_id, related_bookmark_id),
    CHECK (bookmark_id != related_bookmark_id)
);

-- Enable RLS
ALTER TABLE bookmark_relationships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their bookmark relationships" ON bookmark_relationships
    FOR SELECT USING (
        bookmark_id IN (
            SELECT id FROM bookmarks WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bookmark relationships" ON bookmark_relationships
    FOR INSERT WITH CHECK (
        bookmark_id IN (
            SELECT id FROM bookmarks WHERE user_id = auth.uid()
        ) AND
        related_bookmark_id IN (
            SELECT id FROM bookmarks WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their bookmark relationships" ON bookmark_relationships
    FOR DELETE USING (
        bookmark_id IN (
            SELECT id FROM bookmarks WHERE user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookmark_relationships_bookmark_id ON bookmark_relationships(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_relationships_related_bookmark_id ON bookmark_relationships(related_bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_relationships_type ON bookmark_relationships(relationship_type);
`;return n.NextResponse.json({success:!1,message:"Database setup required",tableExists:!1,setupInstructions:{title:"Manual Database Setup Required",description:"To enable the Related Bookmarks feature, please run the following SQL in your Supabase dashboard:",steps:["1. Go to your Supabase project dashboard","2. Navigate to the SQL Editor","3. Copy and paste the SQL below",'4. Click "Run" to execute the query',"5. Refresh this page to use the Related Bookmarks feature"],sql:r,dashboardUrl:"https://app.supabase.com/projects"}})}catch(e){return console.error("Database setup error:",e),n.NextResponse.json({success:!1,error:"Database setup failed",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}let p=new t.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/setup-database/route",pathname:"/api/setup-database",filename:"route",bundlePath:"app/api/setup-database/route"},resolvedPagePath:"/Volumes/Softwaare Program/apptivity final v1/src/app/api/setup-database/route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:k,workUnitAsyncStorage:u,serverHooks:E}=p;function l(){return(0,i.patchFetch)({workAsyncStorage:k,workUnitAsyncStorage:u})}},78335:()=>{},96487:()=>{},96559:(e,r,a)=>{"use strict";e.exports=a(44870)}};var r=require("../../../webpack-runtime.js");r.C(e);var a=e=>r(r.s=e),s=r.X(0,[80],()=>a(70226));module.exports=s})();