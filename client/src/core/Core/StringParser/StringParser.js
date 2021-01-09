import utils from '../../utils'
import { getValue, useValue } from '../hooks'

const StringParser = {
  setDefault() {
    this.result = {
      tags: [],
      textNodes: [],
    }
    this.detections = {
      startOpenTags: [],
      endOpenTags: [],
      startCloseTags: [],
      endCloseTags: [],
      startPropNames: [],
      endPropNames: [],
      startPropValues: [],
      endPropValues: [],
      startChildren: [],
      endChildren: [],
      startTextNode: [],
      endTextNode: [],
    }
    this.expectations = {
      expectChildrenOfTag: [],
      expectStartTextNode: true,
    }
    this.position = 0
  },

  defaultParseStringParameters: {
    string: '',
    customTypeTemplates: [],
  },

  parseStringToObject(parameters = this.defaultParseStringParameters) {
    this.setDefault()

    const { string, customTypeTemplates } = parameters

    this.string = string

    // if (this.string.trim() === '') {
    //   this.detections.startTextNode.push(0)
    //   this.saveTextNode('')
    //   console.log(this.result)
    //   return this.result
    // }

    this.iterateString()
    this.detectGlobalError()
    this.detectCustomTypes(customTypeTemplates)

    return this.result
  },

  iterateString() {
    for (let value of this.string) {
      this.prevChar = this.currentChar
      this.currentChar = value

      this.getDetections()

      this.position++
    }
  },

  getDetections() {
    this.detectException()
    this.detectLocalError()

    if (this.exсeptionPosition !== this.position) {
      const space = this.detectSpace()

      if (space) {
        this.detectEnter()
      } else {
        this.detectNoSpace()
        this.detectLessChar()
        this.detectLetterChar()
        this.detectSlashChar()
        this.detectMoreChar()
        this.detectEqualChar()
        this.detectQuote()
      }

      this.detectStringEnd()
    } else {
      this.removeExceptionChar()
    }
  },

  detectCustomTypes(templatesArr) {
    this.result.tags.forEach(obj => {
      if (templatesArr.some(template => template.test(obj.type))) {
        obj.custom = true
      }
    })
  },

  detectException() {
    const result = this.detectChar('\\')

    if (result) {
      this.exсeptionPosition = this.position + 1
    }

    return result
  },

  removeChar(position) {
    const stringLength = this.string.length
    const isStart = position === 0
    const isEnd = position === stringLength - 1
    const notString = position < 0 || position > stringLength - 1
    const firstPart = notString
      ? this.string
      : isStart
      ? ''
      : this.string.slice(0, position)
    const secondPart = notString
      ? ''
      : isEnd
      ? ''
      : this.string.slice(position + 1, stringLength)

    this.string = firstPart + secondPart
  },

  removeCurrentChar() {
    this.removeChar(this.position)
    this.position--
    this.prevChar = this.string[this.position - 1]
  },

  removePrevChar() {
    this.removeChar(this.position - 1)
    this.position--
    this.prevChar = this.string[this.position - 1]
  },

  removeExceptionChar() {
    this.removePrevChar()
    this.exсeptionPosition = null
  },

  detectLocalError() {},

  detectGlobalError() {},

  saveType(type) {
    const object = {
      id: utils.uuid(),
      position: this.detections.startOpenTags[
        this.detections.startOpenTags.length - 1
      ],
      type,
      props: {},
      children: null,
      childrenArr: [],
      // childrenId: []
    }

    object.parent =
      this.expectations.expectChildrenOfTag.length > 0
        ? this.result.tags[
            this.expectations.expectChildrenOfTag[
              this.expectations.expectChildrenOfTag.length - 1
            ]
          ]
        : null

    if (object.parent) {
      object.parent.childrenArr.push(object)
      // object.parent.childrenId.push(object.id)
    }

    this.result.tags.push(object)
  },

  saveProp(propName, propValue) {
    this.result.tags[this.result.tags.length - 1].props[propName] = propValue
  },

  saveChildren(children) {
    this.result.tags[
      this.expectations.expectChildrenOfTag[
        this.expectations.expectChildrenOfTag.length - 1
      ]
    ].children = children

    this.expectations.expectChildrenOfTag.pop()
  },

  saveTextNode(text) {
    const object = {
      id: utils.uuid(),
      position: this.detections.startTextNode[
        this.detections.startTextNode.length - 1
      ],
      textNode: true,
      children: text,
    }

    object.parent =
      this.expectations.expectChildrenOfTag.length > 0
        ? this.result.tags[
            this.expectations.expectChildrenOfTag[
              this.expectations.expectChildrenOfTag.length - 1
            ]
          ]
        : null

    if (object.parent) {
      object.parent.childrenArr.push(object)
      // object.parent.childrenId.push(object.id)
    }

    this.result.textNodes.push(object)
  },

  detectStringEnd() {
    const result = this.position === this.string.length - 1

    if (result) {
      if (this.expectations.expectEndTextNode) {
        this.detections.endTextNode.push(this.position)

        const text = this.cut(
          this.detections.startTextNode[
            this.detections.startTextNode.length - 1
          ],
          this.position
        )

        this.saveTextNode(text)

        this.expectations.expectEndTextNode = false
      }
    }

    return result
  },

  detectEnter() {
    const result = this.detectChar('\n')

    if (result) {
      // if (this.lastEnterPosition === this.position - 1) {
      //     this.removeCurrentChar()
      // } else {
      this.lastEnterPosition = this.position
      // }
    }

    return result
  },

  detectNoSpace() {
    // const result = this.detectNoChars(this.getCharsGroupeByName('space'))

    // if (result) {
    if (
      this.expectations.expectEndTextNode &&
      this.lastEnterPosition === this.position - 1
    ) {
      // this.removePrevChar()
      // this.lastEnterPosition = null
    }

    if (this.expectations.expectStartTextNode && this.currentChar !== '<') {
      this.detections.startTextNode.push(this.position)

      this.expectations.expectStartTextNode = false
      this.expectations.expectEndTextNode = true
    }
    // }

    // return result
  },

  detectSpace() {
    const result = this.detectChars(this.getCharsGroupeByName('space'))

    if (result) {
      if (
        this.expectations.expectEndTextNode &&
        this.lastEnterPosition === this.position - 1
      ) {
        // this.removeCurrentChar()
      }

      if (this.expectations.expectEndTagName) {
        const type = this.cut(
          this.detections.startOpenTags[
            this.detections.startOpenTags.length - 1
          ] + 1,
          this.position - 1
        )

        this.saveType(type)

        this.expectations.expectEndTagName = false
        this.expectations.expectStartPropName = true
      }

      if (this.expectations.expectEndPropName) {
        this.detections.endPropNames.push(this.position - 1)
        this.detections.startPropValues.push(this.position - 1)
        this.detections.endPropValues.push(this.position - 1)

        const propName = this.cut(
          this.detections.startPropNames[
            this.detections.startPropNames.length - 1
          ],
          this.position - 1
        )

        this.saveProp(propName, 'true')

        this.expectations.expectEndPropName = false
        this.expectations.expectStartPropName = true
      }
    }

    return result
  },

  detectLessChar() {
    const result = this.detectChar('<')

    if (result) {
      this.expectations.expectStartOpenTag = true
      this.expectations.expectStartCloseTag = true
      this.expectations.expectStartTextNode = false

      if (this.expectations.expectEndTextNode) {
        this.detections.endTextNode.push(this.position - 1)

        const text = this.cut(
          this.detections.startTextNode[
            this.detections.startTextNode.length - 1
          ],
          this.position - 1
        )

        this.saveTextNode(text)

        this.expectations.expectEndTextNode = false
      }
    }

    return result
  },

  detectLetterChar() {
    const result = /[A-Za-z]/.test(this.currentChar)

    if (result) {
      if (this.expectations.expectStartOpenTag) {
        this.detections.startOpenTags.push(this.position - 1)

        this.expectations.expectStartOpenTag = false
        this.expectations.expectStartCloseTag = false
        this.expectations.expectEndTagName = true
        this.expectations.expectEndOpenTag = true
      }

      if (this.expectations.expectStartPropName) {
        this.detections.startPropNames.push(this.position)

        this.expectations.expectStartPropName = false
        this.expectations.expectEndPropName = true
      }
    }

    return result
  },

  detectSlashChar() {
    const result = this.detectChar('/')

    if (result) {
      if (this.expectations.expectStartCloseTag) {
        this.detections.startCloseTags.push(this.position - 1)

        this.expectations.expectStartOpenTag = false
        this.expectations.expectStartCloseTag = false
        this.expectations.expectEndCloseTag = true

        // save children between open and close tags
        this.detections.endChildren.push(this.position - 2)

        const children = this.cutChildren()

        this.saveChildren(children)
      }

      if (this.expectations.expectEndTagName) {
        this.detections.endOpenTags.push(this.position + 1)
        this.detections.startCloseTags.push(this.position + 1)
        this.detections.endCloseTags.push(this.position + 1)

        const type = this.cut(
          this.detections.startOpenTags[
            this.detections.startOpenTags.length - 1
          ] + 1,
          this.position - 1
        )

        this.saveType(type)

        this.expectations.expectEndTagName = false
        this.expectations.expectEndOpenTag = false

        // save null children of selfclosed tags
        this.detections.startChildren.push(this.position - 1)
        this.detections.endChildren.push(this.position - 1)

        this.expectations.expectChildrenOfTag.push(
          this.detections.startChildren.length - 1
        )

        this.saveChildren(null)
      }

      if (this.expectations.expectStartPropName) {
        this.detections.endOpenTags.push(this.position + 1)
        this.detections.startCloseTags.push(this.position + 1)
        this.detections.endCloseTags.push(this.position + 1)

        this.expectations.expectStartPropName = false
        this.expectations.expectEndOpenTag = false

        // save null children of selfclosed tags
        this.detections.startChildren.push(this.position - 1)
        this.detections.endChildren.push(this.position - 1)

        this.expectations.expectChildrenOfTag.push(
          this.detections.startChildren.length - 1
        )

        this.saveChildren(null)
      }

      if (this.expectations.expectEndPropName) {
        this.detections.endPropNames.push(this.position - 1)
        this.detections.startPropValues.push(this.position - 1)
        this.detections.endPropValues.push(this.position - 1)

        const propName = this.cut(
          this.detections.startPropNames[
            this.detections.startPropNames.length - 1
          ],
          this.position - 1
        )

        this.saveProp(propName, 'true')

        this.expectations.expectEndPropName = false
        this.expectations.expectEndOpenTag = false

        // save null children of selfclosed tags
        this.detections.startChildren.push(this.position - 1)
        this.detections.endChildren.push(this.position - 1)

        this.expectations.expectChildrenOfTag.push(
          this.detections.startChildren.length - 1
        )

        this.saveChildren(null)
      }
    }

    return result
  },

  detectMoreChar() {
    const result = this.detectChar('>')

    if (result) {
      this.expectations.expectStartTextNode = true

      if (this.expectations.expectEndTagName) {
        this.detections.endOpenTags.push(this.position)

        const type = this.cut(
          this.detections.startOpenTags[
            this.detections.startOpenTags.length - 1
          ] + 1,
          this.position - 1
        )

        this.saveType(type)

        this.expectations.expectEndTagName = false
        this.expectations.expectEndOpenTag = false

        this.detections.startChildren.push(this.position + 1)

        this.expectations.expectChildrenOfTag.push(
          this.detections.startChildren.length - 1
        )
      }

      if (this.expectations.expectEndCloseTag) {
        this.detections.endCloseTags.push(this.position)

        this.expectations.expectEndCloseTag = false
      }

      if (this.expectations.expectStartPropName) {
        this.detections.endOpenTags.push(this.position)

        this.expectations.expectStartPropName = false
        this.expectations.expectEndOpenTag = false

        this.detections.startChildren.push(this.position + 1)

        this.expectations.expectChildrenOfTag.push(
          this.detections.startChildren.length - 1
        )
      }

      if (this.expectations.expectEndPropName) {
        this.detections.endPropNames.push(this.position - 1)
        this.detections.startPropValues.push(this.position - 1)
        this.detections.endPropValues.push(this.position - 1)

        const propName = this.cut(
          this.detections.startPropNames[
            this.detections.startPropNames.length - 1
          ],
          this.position - 1
        )

        this.saveProp(propName, 'true')

        this.expectations.expectEndPropName = false
        this.expectations.expectEndOpenTag = false

        this.detections.startChildren.push(this.position + 1)

        this.expectations.expectChildrenOfTag.push(
          this.detections.startChildren.length - 1
        )
      }
    }

    return result
  },

  detectEqualChar() {
    const result = this.detectChar('=')

    if (result) {
      if (this.expectations.expectEndPropName) {
        this.detections.endPropNames.push(this.position - 1)

        const propName = this.cut(
          this.detections.startPropNames[
            this.detections.startPropNames.length - 1
          ],
          this.position - 1
        )

        this.saveProp(propName, '')

        this.lastPropName = propName

        this.expectations.expectEndPropName = false
        this.expectations.expectStartPropValue = true
      }
    }

    return result
  },

  detectQuote() {
    const result = this.detectChars(this.getCharsGroupeByName('quote'))

    if (result) {
      if (
        this.expectations.expectEndPropValue &&
        this.lastQuote === this.currentChar
      ) {
        this.detections.endPropValues.push(this.position - 1)

        const propValue = this.cut(
          this.detections.startPropValues[
            this.detections.startPropValues.length - 1
          ],
          this.position - 1
        )

        this.saveProp(this.lastPropName, propValue)

        this.expectations.expectEndPropValue = false
        this.expectations.expectStartPropName = true

        this.lastQuote = null
      }
      if (this.expectations.expectStartPropValue) {
        this.detections.startPropValues.push(this.position + 1)

        this.expectations.expectStartPropValue = false
        this.expectations.expectEndPropValue = true

        this.lastQuote = this.currentChar
      }
    }

    return result
  },

  cut(startPosition, endPosition) {
    return this.string.slice(startPosition, endPosition + 1).trim()
  },

  cutChildren() {
    return this.cut(
      this.detections.startChildren[
        this.expectations.expectChildrenOfTag[
          this.expectations.expectChildrenOfTag.length - 1
        ]
      ],
      this.detections.endChildren[this.detections.endChildren.length - 1]
    )
  },

  detectChar(char) {
    return this.currentChar === char
  },

  detectChars(charsArr) {
    if (!utils.isArray(charsArr)) {
      throw new Error(`Type Error. ${charsArr} must be an Array`)
    }

    return charsArr.some(char => this.detectChar(char))
  },

  detectNoChar(char) {
    return !this.detectChar(char)
  },

  detectNoChars(charsArr) {
    return !this.detectChars(charsArr)
  },

  getCharsGroupeByName(name) {
    switch (name) {
      case 'enter':
        return ['\n']
      case 'space':
        return ['\t', '\n', '\v', ' ']
      case 'less':
        return ['<']
      case 'more':
        return ['>']
      case 'slash':
        return ['/']
      case 'back slash':
        return ['\\']
      case 'equal':
        return ['=']
      case 'quote':
        return ['"', "'", '`']
      default:
        return undefined
    }
  },
}

export default StringParser
