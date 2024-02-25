import React from '../core/React'
import { describe, it, expect  } from 'vitest'

describe('createElement', () => {
    it('props is null', () => {
        const el = React.createElement('div', null, 'app')

        expect(el).toEqual({
            type: 'div',
            props: {},
            children: [
                {
                    type: 'text',
                    props: {
                        nodeValue: 'app'
                    },
                    children: []
                }
            ]
        })
    })
})