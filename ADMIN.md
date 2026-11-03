# Site admin

`/admin` lets Max add, edit, reorder and delete **Projects** and **Sound design** entries
(titles and descriptions in French and English, plus the 3D model / video / audio file) without opening AWS.
Changes go live as soon as they're saved.

## One-time setup

### 1. Choose a password and generate the secrets

```bash
npm run hash-password
```

You'll be prompted for the password (min. 12 characters; a passphrase of 4+ random words is ideal).
It prints two lines. Add both as environment variables wherever the site is hosted (and in `.env.local` for local dev):

| Variable | What it is |
| --- | --- |
| `ADMIN_PASSWORD_HASH` | scrypt hash of the password. The password itself is never stored. |
| `ADMIN_SESSION_SECRET` | Random key used to sign login cookies. |

To **change the password**, run the script again and replace `ADMIN_PASSWORD_HASH`.
To **log out every device** (e.g. if a laptop is lost), replace `ADMIN_SESSION_SECRET`.
If either variable is missing, the admin is disabled (the login page says so).

### 2. Give the site's AWS credentials write access

The site already reads from DynamoDB and S3. The admin also needs to write. Attach this to the IAM user/role
the site runs as (replace the table name, region/account, and bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem"],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/TABLE_NAME",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/TABLE_NAME/index/type-order-index"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::BUCKET_NAME/projects/*", "arn:aws:s3:::BUCKET_NAME/sounds/*"]
    }
  ]
}
```

### 3. Allow browser uploads to the S3 bucket (CORS)

Files are uploaded straight from the browser to S3, so the server never handles 100 MB+ files.
In the S3 console → bucket → **Permissions → CORS**, add (with your real domain):

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

Add `http://localhost:3000` to `AllowedOrigins` too if you want to test uploads locally.

## Assumptions about the data

- DynamoDB table (`DYNAMO_TABLE_NAME`) has partition key **`id`** (string), and a GSI **`type-order-index`**
  (partition `type`, sort `order`). New items get a random UUID as `id`.
- Files live in S3 (`S3_BUCKET_NAME`) at `projects/<file_name>` and `sounds/<file_name>`.
- Allowed files: projects `.glb` / `.mp4`, sounds `.mp3` / `.wav`, up to 250 MB.

## Security model

- **Password**: only an scrypt hash is stored; verification is constant-time.
- **Session**: an `HttpOnly`, `Secure`, `SameSite=Strict` cookie holding an expiry signed with HMAC-SHA256.
  It lasts 8 hours and can't be read by JavaScript or forged without `ADMIN_SESSION_SECRET`.
- **Every admin API route** checks the session server-side. `/admin` itself is server-rendered and redirects to login
  without a valid session.
- **CSRF**: besides `SameSite=Strict`, all write requests must come from the site's own `Origin` and be JSON.
- **Brute force**: 5 failed logins per IP per 15 min, and 50 site-wide per 15 min. This is in-memory, so it's
  per server instance. A strong password is the real protection.
- **Uploads**: presigned S3 POSTs valid 10 minutes, locked to one server-generated file name, one content type and
  a max size. Users can't choose the S3 key, so they can't overwrite other files.
- **Headers**: admin pages and APIs send `X-Frame-Options: DENY`, `noindex`, and `no-store`.

If more than one person ever needs access, or you want 2FA, swap the password login for AWS Cognito or
an OAuth provider. The rest of the admin can stay as is.
