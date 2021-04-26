const fetch = require('node-fetch')

const { API_TOKEN, NAMES = '' } = process.env
const year = 2020

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

  const { threads = [] } = json

  return threads.map((email) => email.snippet)
}

const formatDate = (date) => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const formatDateYearLast = (date) => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

const getEmailsForMonth = (month) => {
  const beforeDate = new Date(year, month - 1, 15)
  const afterDate = new Date(
    month === 1 ? year - 1 : year,
    month === 1 ? 11 : month - 2,
    15
  )

  return getEmails([
    `after:${formatDate(afterDate)}`,
    `before:${formatDate(beforeDate)}`,
  ])
}

const getDataForMonth = async (month) => {
  const date = formatDateYearLast(new Date(year, month - 1, 1))
  /** @type string[] */
  const emails = await getEmailsForMonth(month)
  const output = []

  /** @type string[] */
  const names = NAMES.split(',')

  for (const name of names) {
    const matches = emails.filter((email) =>
      name
        .split(' ')
        .some((namePart) =>
          email.toLowerCase().includes(namePart.toLowerCase())
        )
    )

    for (const match of matches) {
      const money = match.match(/(?<money>\$\d+)\./)?.groups?.money

      output.push([name, date, money])
    }
  }

  return output.map((row) => row.join(',')).join('\n') + '\n'
}

const getDataForYear = async () => {
  let output = ''

  for (let i = 1; i < 13; i++) {
    output += await getDataForMonth(i)
  }

  return output
}

const main = async () => {
  const data = await getDataForYear()

  console.log(data)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
