# Kickoff Meeting: Transcript Analysis

| | |
|---|---|
| **Source** | [`Research/transcript.txt`](../../Research/transcript.txt) (Teams AI transcription, marked "AI-generated content may be incorrect") |
| **Meeting date** | Unknown (Q-004) |
| **Analysed** | 2026-10-10 |
| **Speakers** | Vivek Bhatnagar (sets the vision and gives direction), Anil Tiwari (team) |
| **Quality** | English speech written out in Hindi (Devanagari) script, with many mis-heard words. The English below is Claude's reconstruction; unsure parts are marked [?] |
| **Gap** | About 8 minutes are missing (1:37 → 9:31). **The user said to ignore it** (2026-10-10) |

## Key takeaways

1. **What:** a "Second Brain for UnifyCloud": one layer that combines the company's data sources so the data is **available to different AI agents**.
2. **Purpose:** provide **reference and context for every task** in the company, from small (updating a lead) to large (writing an SOW, submitting customer […cut off]).
3. **The pain:** for each opportunity, TPMs are asked to:
   - fill in a form with **50+ fields**
   - record meetings when they're scheduled
   - upload the transcript after each meeting
   - upload the action items
   - schedule the next meeting and the next action

   **None of the TPMs do this**, in any region (Noida, America, Europe, Australia). This causes a **constant fight between marketing/sales and the TPMs**, who say they're asked for too many fields.
4. **Clear first use case:** **AI fills in the opportunity/lead form.** Vivek estimates **at least 45 of the 50 fields** can be filled just by scanning emails, SharePoint and so on. Example: the system already knows from email that Akshay scheduled a meeting with an account on a given date, so nobody should have to type it in.
5. **Meeting capture:** the TPM shouldn't have to upload transcripts; the system should pick them up itself.
6. **Access:** "you might need an email ID that has access to emails and OneDrive". That suggests a service account with broad access.
7. **Direction:** "We're not the first one; every company has built this by now." Research how others do it and find the best way. Use AI and move fast: "you don't have infinite time".
8. **Added late (10:01):** **product specifications and UnifyCloud's capabilities** should also be part of the Second Brain.
9. **Agreed next steps:**
   - The team creates **specifications and architecture first**, then brings questions to Vivek.
   - **Study the opportunity form's fields** with **Amit / Rajat** (whoever is in the office).

## Reconstructed transcript (English)

| Time | Speaker | What was said (reconstructed) |
|---|---|---|
| 0:03 | Vivek | "[It's] sort of a second brain for UnifyCloud, combining these sources like DevOps, Partner Center, Nomination Portal, everybody's email, SharePoint, Teams channels, meeting recordings…" |
| 0:17 | Vivek | "…and other things, correct?" |
| 0:20 | Vivek | "So we're trying to create a second brain where whatever you want to access, the data should be available for different AI agents. The purpose of the second brain is to provide the reference and context for every task we do in the company, whether it's a smaller one like updating a lead, or a larger task like writing an SOW or submitting customer [… cut off]" |
| 0:49 | Vivek | "Right now, the problem is…" |
| 0:54 | Vivek | "Nobody updates. Can you imagine how many…" |
| 1:01 | Vivek | "We ask TPMs to fill [the form] per opportunity [?]." |
| 1:06 | Vivek | "It's more than 50 fields, and humanly none of these TPMs do it. In addition to filling the 50 fields, we also ask them to record when they've scheduled meetings, and once they've had the meeting, upload the transcript." |
| 1:11 | Anil | "To whom?" *(Hindi: "किसको?")* |
| 1:24 | Vivek | "Upload the action items, then schedule the next meeting and next action. I'm telling you, none of the TPMs are doing it, whether they're in Noida, America, Europe or Australia. None of that, correct?" |
| 1:37 | Vivek | "And there's a constant fight between the marketing and sales team vs the TPMs. They all get frustrated and blame each other. TPMs say 'you guys ask too many fields' and…" |
| — | — | **⚠️ ~8 minutes missing from the transcript (1:37 → 9:31)** |
| 9:31 | Vivek | "…build some form of it, right? We're not the first one; every company has [built this] by now. You guys can research, see how people are doing it, what's the best way of doing this. But this has to be done." |
| 9:33 | Anil | "OK… OK sir." |
| 9:46 | Vivek | "Now, if you have any questions, anything?" |
| 9:53 | Anil | "No sir. First let's create the specifications and architecture, then based on that we'll ask you whatever questions we have." |
| 10:01 | Vivek | "I forgot to add one more: product specifications, and our capabilities, UnifyCloud's capabilities. That would be part of it, I think, Anil." |
| 10:18 | Anil | "Yes sir, [I'll] create it [?]. OK?" |
| 10:22 | Vivek | "You don't have infinite time. Use AI and everything, and let's keep going." |
| 10:29 | Vivek | "If you have any questions right now, that's fine. I'm only giving you very broad outlines; it's not that you guys know everything yet." |
| 10:39 | Anil | "So, for the TPMs, there are lots of fields in the lead form submission. So how are we going to… we need to fill the lead form through AI, make it [smooth?]." |
| 10:53 | Vivek | "For example, you're already scanning everybody's emails, so you already know that, say, Akshay has scheduled a meeting on this date with this account. So I shouldn't need to go and fill in that information. You already have it in the database; you can fill it in yourself. Out of those 50 fields, you can actually fill at least 45 just by scanning emails, SharePoint and everything. You can find the information." |
| 11:20 | Vivek | "And Akshay doesn't need to go and upload the transcript; you can copy the transcript and upload it. You need some access for this. For example, you might need an email ID that has access to emails and to OneDrive, because people store things on OneDrive. But the idea is that there's enough intelligence that out of those 50 fields, 45 can be filled just by scanning emails. That's why you should study the system…" |
| 11:50 | Vivek | "…[with] Amit, and see what the fields are. Don't go and waste time. Amit or Rajat, whoever is available in the office…" |
| 11:59 | Anil | "OK sir, sure." |
| 12:03 | Vivek | "It will take research, it will take time… let's go and build it, OK?" |
| 12:18 | Vivek | "If there are no other questions, give me a very quick brief on what everybody else is doing…" |
| 12:30–13:09 | Anil | *Unrelated status update (not this project):* worked with Ghanshyam on **GTM Planner** and reviewed its portal; **CloudAtlas** work finished; UnifyCloud bugs resolved except the content part. Asks to stop the recording. |

## What this means for us

| # | Implication | Tracked as |
|---|---|---|
| 1 | The **opportunity form auto-fill** is the concrete, measurable problem. It's a strong candidate for the first use case and the clickthrough demo | Q-010 |
| 2 | We need the **actual list of 50+ fields** and the system they live in before designing anything | Q-007, Q-008 |
| 3 | **Build vs buy:** "every company has built this", so research existing approaches (enterprise knowledge/AI platforms, Microsoft 365 / Graph-based options) before designing our own | Research topic (to do) |
| 4 | **Reading everyone's email and OneDrive** is a big privacy, legal and security matter. Staff are in Europe (GDPR) and Australia, among other regions | Q-014 |
| 5 | "Available to **different AI agents**" means the Second Brain is a **platform or data layer**, not only one app. We need to know which agents will use it | Q-015 |
| 6 | The data-source list differs between the spreadsheet and the meeting | Q-011, Q-012 |
| 7 | The 8-minute gap may hold requirements we don't know about | Q-005 |
