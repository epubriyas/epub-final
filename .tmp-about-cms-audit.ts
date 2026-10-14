import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.ts'
const payload=await getPayload({config})
const result=await payload.find({collection:'services',overrideAccess:false,limit:100,depth:0,pagination:false,select:{title:true,slug:true,status:true}})
console.log(JSON.stringify(result.docs.map(({slug,status})=>({slug,status})),null,2))
const settings=await payload.findGlobal({slug:'site-settings',overrideAccess:false})
console.log('site-settings about fields:',JSON.stringify({aboutPage:Boolean(settings.aboutPage),legalReviewed:settings.legalReviewed}))
await payload.destroy()
