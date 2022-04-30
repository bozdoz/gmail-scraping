# How did I do any of this?

1. Created an API KEY, and a OAuth Client ID in Google Cloud Console
2. Oauth client id had to allow a localhost origin
3. Followed the Gmail API QuickStart: https://developers.google.com/gmail/api/quickstart/js
4. Checked network tab to get API_TOKEN (See Get API_TOKEN)
5. Set API_TOKEN in env
6. Ran `npm start`

### What is this?

An example of the Gmail API.

Use-case is to get emails from e-transfers to tally up how much money people have sent you over the past year.

### Run Example

```bash
> NAMES="Mayor Quimby,Principal Skinner,Chief Wiggum" npm start
 Mayor Quimby,12/1/2020,$675
 Principal Skinner,12/1/2020,$950
 Chief Wiggum,12/1/2020,$670
```

### Get API_TOKEN

Run `npx serve` and navigate to http://localhost:5000. Enter your credentials (client id and maybe client secret), click start, and follow the process. Then check the network tab for something from content-gmail.googleapis.com/gmail/v1/users/me/labels. It should have a header for Authorization with your API_TOKEN.
