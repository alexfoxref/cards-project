const useStyles = object => {
  const arr = []

  for (const key in object) {
    let resultKey = key

    if (key.toLowerCase() !== key) {
      resultKey = resultKey
        .split('')
        .map(char => {
          if (/[A-Z]/.test(char)) {
            return `-${char.toLowerCase()}`
          }

          return char
        })
        .join('')
    }

    arr.push(`${resultKey}:${object[key]};`)
  }

  return arr.join('')
}

export default useStyles
