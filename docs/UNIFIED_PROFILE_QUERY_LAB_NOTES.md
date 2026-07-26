# Unified Profile Query Lab Notes

This update expands the Unified Profile Dashboard without exposing Salesforce secrets or arbitrary SOQL.

## What changed

- App 1 now includes a controlled live Salesforce query lab.
- The browser can choose Accounts, Contacts, Opportunities, or Cases.
- The browser can choose a record limit of 3, 5, or 10.
- Railway validates those controls and builds the SOQL query server-side.
- Returned records are shown in a sortable table.
- Salesforce IDs and record names open centered modal overlays.
- Existing mock profile, metric, and activity items also open modal overlays for demo explainability.

## Why this is safer

The browser does not send unrestricted SOQL. It sends only allowlisted options such as:

```json
{
  "queryKey": "accounts",
  "limit": 5
}
```

Railway decides which Salesforce query is allowed and returns sanitized output to the React app.

## Portfolio wording

The Unified Profile Dashboard demonstrates a controlled Salesforce query pattern through a Railway-hosted Node.js proxy. Visitors can switch between approved CRM record types and drill into sanitized record details, while Salesforce OAuth credentials remain server-side in Railway.

## Honest limitation

The profile card and activity timeline remain simulated Data Cloud-style UI elements. The live query lab proves live Salesforce CRM data access through the proxy. Do not describe this as a full Data Cloud DMO or calculated-insight implementation unless those APIs are wired later.
