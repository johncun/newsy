export const dt = (dstr: string) => {
  const date = new Date(dstr)
  return (
    date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    + ' '
    + date.toLocaleTimeString(undefined, {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}


