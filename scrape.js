const fetch = require('node-fetch')

const { API_TOKEN, NAMES = '', YEAR = 2021 } = process.env

/** Uses Gmail API to get threads, and return just the snippets */
const getEmails = async (q) => {
  const url = 'https://www.googleapis.com/gmail/v1/users/me/threads'
  const qs = `?q=in:ETransfers%20-mint%20-communications%20${q.join('%20')}`
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
  }

  const response = await fetch(`${url}${qs}`, {
    headers,
  })

  const json = await response.json()

  const { error, threads = [] } = json

  if (error) {
    throw new Error(error.message)
  }

  return threads.map((email) => email.snippet)
}

/** format date for gmail search API */
const formatDate = (date) => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

/** format date for my own personal spreadsheet */
const formatDateYearLast = (date) => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

/** passes the "after:" and "before:" queries to the gmail API method */
const getEmailsForMonth = (month) => {
  const beforeDate = new Date(YEAR, month - 1, 15)
  const afterDate = new Date(
    month === 1 ? YEAR - 1 : YEAR,
    month === 1 ? 11 : month - 2,
    15
  )

  return getEmails([
    `after:${formatDate(afterDate)}`,
    `before:${formatDate(beforeDate)}`,
  ])
}

/** returns csv-formatted data for a given month: name,date,dollar-amount */
const getDataForMonth = async (month) => {
  const date = formatDateYearLast(new Date(YEAR, month - 1, 1))
  /** @type string[] */
  const emails = await getEmailsForMonth(month)
  const output = []

  /** @type string[] */
  const names = NAMES.split(/,\s?/)

  for (const name of names) {
    const snippets = emails.filter((email) =>
      name
        .toLowerCase()
        .split(' ')
        .every((namePart) => email.toLowerCase().includes(namePart))
    )

    for (const snippet of snippets) {
      // regular expression to find dollar amount in e-transfer snippet
      const money = snippet.match(/(?<money>\$\d+)\./)?.groups?.money

      output.push([name, date, money])
    }
  }

  return output.map((row) => row.join(',')).join('\n') + '\n'
}

/** calls getDataForMonth for all months */
const getDataForYear = async () => {
  let output = ''

  for (let i = 1; i < 13; i++) {
    output += await getDataForMonth(i)
  }

  return output
}

/** main function, called with `node scrape.js` */
const main = async () => {
  const data = await getDataForYear()

  console.log(data)
}

main()
  .then(() => {
    // exit normally
    process.exit(0)
  })
  .catch((e) => {
    // exit with errors
    console.error(e)
    process.exit(1)
  })
