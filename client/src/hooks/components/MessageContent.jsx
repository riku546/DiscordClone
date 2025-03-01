import { useState, useEffect } from 'react'
import axios from '@/lib/axios.js'
import { useRef } from 'react'

export const useFetchUserId = () => {
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const res = await axios.get('/api/user')
                setUserId(res.data.id)
            } catch (error) {
                console.error(error)
            }
        }

        fetchUserId()
    }, [])

    return userId
}

export const useAutoScroll = messages => {
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    return scrollRef
}

export const useSendMessage = id => {
    const messageInputRef = useRef(null)

    const sendMessage = async () => {
        try {
            await axios.post('/api/dm/message/send', {
                dm_id: id,
                content: messageInputRef.current.value,
            })

            messageInputRef.current.value = ''
        } catch (error) {
            console.error(error)
        }
    }

    const handleEnterKey = event => {
        if (event.key === 'Enter') {
            sendMessage()
        }
    }

    return { messageInputRef, handleEnterKey, sendMessage }
}
