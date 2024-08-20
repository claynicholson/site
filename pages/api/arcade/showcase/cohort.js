import AirtablePlus from "airtable-plus";
import { ensureAuthed } from "./login/test";

export default async function handler(req, res) {
  const user = await ensureAuthed(req);
  if (user.error) {
    return res.status(401).json(user);
  }

  // You need to pass the authToken from the client-side to the server, 
  // e.g., through headers, query, or body in the request.
  const authToken = req.headers['Bearer'] || req.body.authToken;

  if (!authToken) {
    return res.status(400).json({ error: "Auth Token not provided" });
  }

  const airtable = new AirtablePlus({
    apiKey: process.env.AIRTABLE_API_KEY,
    baseID: 'app4kCWulfB02bV8Q',
    tableName: "Cohorts"
  });

  const cohorts = await airtable.read({
    filterByFormula: `FIND('${authToken}', {Allowed Voter Keys})`
  });

  const results = cohorts.map(record => ({
    id: record.id,
    title: record.fields['Name'] || '',
    desc: record.fields['Description'] || '',
    slackLink: record.fields['Slack Link'] || '',
    codeLink: record.fields['Code Link'] || '',
    playLink: record.fields['Play Link'] || '',
    imageLink: record.fields['ScreenshotLink'] || '',
    githubProf: record.fields['Github Profile'] || '',
    user: user.fields['Name'], 
    color: record.fields['color'] || '',
    textColor: record.fields['textColor'] || ''
  }));

  return res.status(200).json({ projects: results });
}
