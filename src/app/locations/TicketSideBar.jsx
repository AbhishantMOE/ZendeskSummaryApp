import { useEffect, useState } from 'react'
import { useClient } from '../hooks/useClient'
import styled from 'styled-components'
import { Grid, Row } from '@zendeskgarden/react-grid'
import { XL } from '@zendeskgarden/react-typography'

const SUMMARY_EMAIL = 'yashwanth@moengage.com'

function formatSummary(html) {
  if (!html) return ''
  // Remove "--- AI Agent Analysis ---" (with or without <p> tags)
  let cleaned = html.replace(/<p[^>]*>--- AI Agent Analysis ---<\/p>/i, '')
  cleaned = cleaned.replace(/--- AI Agent Analysis ---/i, '')
  // Center and bold all h2 headings
  cleaned = cleaned.replace(/<h2([^>]*)>(.*?)<\/h2>/g, (_, attrs, text) =>
    `<h2${attrs} style="text-align:center;font-weight:bold;">${text}</h2>`
  )
  // Remove leading/trailing whitespace and blank lines
  cleaned = cleaned.replace(/^\s+|\s+$/g, '')
  return cleaned
}

const TicketSideBar = () => {
  const client = useClient()
  const [ticketId, setTicketId] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    client.get('ticket.id').then(({ 'ticket.id': id }) => setTicketId(id))
  }, [client])

  useEffect(() => {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    setSummary('')
    client.get('ticket.comments').then(({ 'ticket.comments': comments }) => {
      const summaryComment = comments
        .slice()
        .reverse()
        .find(
          c =>
            !c.public &&
            c.author &&
            c.author.email === SUMMARY_EMAIL
        )
      if (summaryComment) {
        setSummary(formatSummary(summaryComment.value))
      } else {
        setSummary('<div>No summary found from yashwanth@moengage.com.</div>')
      }
      setLoading(false)
    }).catch(err => {
      setError('Could not fetch comments: ' + err.message)
      setLoading(false)
    })
  }, [ticketId, client])

  useEffect(() => {
    client.invoke('resize', { width: '100%', height: '600px' })
  }, [client])

  return (
    <GridContainer>
      <Row justifyContent="center">
        <XL isBold>{'Ticket Analysis Summary'}</XL>
      </Row>
      <Row justifyContent="center">
        {loading && <span>Loading summary...</span>}
        {error && <span style={{ color: 'red' }}>{error}</span>}
        {!loading && !error && summary && (
          <SummaryContainer dangerouslySetInnerHTML={{ __html: summary }} />
        )}
      </Row>
    </GridContainer>
  )
}

const GridContainer = styled(Grid)`
  display: grid;
  gap: ${(props) => props.theme.space.sm};
`

const SummaryContainer = styled.div`
  margin-top: 0;
  text-align: left;
  max-width: 400px;
  white-space: normal;
  font-size: 14px;
  line-height: 1.5;
  & h2 {
    font-size: 1.1em;
    margin: 1.5em 0 1em 0;
    color: #17494d;
    text-align: center;
    font-weight: bold;
  }
  & ul, & ol {
    margin-left: 1.2em;
    margin-bottom: 1em;
  }
  & li {
    margin-bottom: 0.5em;
  }
  & strong {
    color: #17494d;
  }
  & code {
    background: #f4f4f4;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.95em;
  }
  & p {
    margin: 0.5em 0;
  }
  & a {
    color: #17494d;
    text-decoration: underline;
    word-break: break-all;
  }
`

export default TicketSideBar