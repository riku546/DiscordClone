'use client'

import { Avatar } from '@/components/ui/avatar'

import { Input } from '@/components/ui/input'
import { Ellipsis, User } from 'lucide-react'

import {
    useAutoScroll,
    useFetchUserId,
} from '@/hooks/components/MessageContent.jsx'
import { usePusher } from '@/hooks/usePusher.js'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@radix-ui/react-hover-card'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useState } from 'react'
import { DialogClose } from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'

export default function MessageContent({
    messageType, // dm or channel
    id /*dm_id or チャンネルid */,
    useMessageCustomHook,
    useOperationMessageCustomHook,
}) {
    const messages = useSelector(state => state.message.value)

    const userId = useFetchUserId()
    const scrollRef = useAutoScroll(messages)
    usePusher(messageType, id)
    const { messageInputRef, handleEnterKey } = useMessageCustomHook(id)

    return (
        <div className="flex flex-col h-screen bg-[#313338] text-gray-100">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto py-4 px-12 space-y-6">
                <div className="space-y-8">
                    {messages &&
                        messages.map(message => (
                            <Message
                                key={message.created_at}
                                message={message}
                                userId={userId}
                                useOperationMessageCustomHook={
                                    useOperationMessageCustomHook
                                }
                            />
                        ))}

                    <div ref={scrollRef}></div>
                </div>
            </div>
            <InputArea
                messageInputRef={messageInputRef}
                handleEnterKey={handleEnterKey}
            />
        </div>
    )
}

const InputArea = ({ messageInputRef, handleEnterKey }) => {
    return (
        <div className="p-4 bg-[#313338] border-t border-gray-700">
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <Input
                        type="text"
                        ref={messageInputRef}
                        onKeyDown={handleEnterKey}
                        placeholder="メッセージを送信"
                        className="bg-[#383A40] border-none text-gray-100 placeholder:text-gray-400"
                    />
                </div>
            </div>
        </div>
    )
}

function Message({ message, userId, useOperationMessageCustomHook }) {
    const [isEditing, setIsEditing] = useState(false)
    const [messageContent, setMessageContent] = useState(message.content)

    const handleMessageArea = () => {
        if (isEditing) {
            //メッセージの編集キャンセル時に必要な前回のメッセージを保存
            localStorage.setItem('previousMessage', message.content)

            return (
                <EditingFiled
                    message={messageContent}
                    created_at={message.created_at}
                    setMessageContent={setMessageContent}
                    setIsEditing={setIsEditing}
                    useOperationMessageCustomHook={
                        useOperationMessageCustomHook
                    }
                />
            )
        } else {
            return messageContent
        }
    }

    //メッセージの作成日時から秒を削除する
    //引数 2022-01-01 10:00:00
    //返り値 2022-01-01 10:00
    const formattedTimestamp = () => {
        const splitTimestamp = message.created_at.split(':')
        return splitTimestamp[0] + ':' + splitTimestamp[1]
    }

    return (
        <div className="flex  items-start gap-4 group">
            <Avatar className="flex justify-center items-center">
                <User />
            </Avatar>
            <div className="flex flex-1 justify-between items-center px-2 py-1">
                <div className="w-9/12">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{message.name}</span>
                        <span className="text-xs text-gray-400">
                            {formattedTimestamp(message.created_at)}
                        </span>
                    </div>
                    <div className="w-4/5  mt-1 text-gray-100 whitespace-pre-line  break-words">
                        {handleMessageArea()}
                    </div>
                </div>
                <div>
                    {/* message.idはメッセージを投稿したユーザーのid  */}
                    {message.user_id === userId && (
                        <MessageOperations
                            setIsEditing={setIsEditing}
                            useOperationMessageCustomHook={
                                useOperationMessageCustomHook
                            }
                            created_at={message.created_at}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

const EditingFiled = ({
    message,
    created_at,
    setMessageContent,
    setIsEditing,
    useOperationMessageCustomHook,
}) => {
    const { handleEditMessage } = useOperationMessageCustomHook()

    return (
        <div className="w-full">
            <input
                className="w-full mt-1 text-gray-100 border-none bg-[#383a40] p-2 rounded whitespace-pre-line  break-words"
                type="text"
                value={message}
                onChange={e => setMessageContent(e.target.value)}
            />

            <div className="flex items-center space-x-3 mt-2">
                <p
                    onClick={() => {
                        setMessageContent(
                            //編集前のメッセージを取得
                            localStorage.getItem('previousMessage'),
                        )
                        setIsEditing(false)
                    }}
                    className="text-gray-400 text-xs hover:cursor-pointer">
                    キャンセル
                </p>
                <p
                    onClick={() => {
                        setIsEditing(false)
                        handleEditMessage(message, created_at)
                    }}
                    className="text-xs text-sky-500 hover:cursor-pointer ">
                    保存
                </p>
            </div>
        </div>
    )
}

const MessageOperations = ({
    setIsEditing,
    useOperationMessageCustomHook,
    created_at,
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Ellipsis className="hover:cursor-pointer" size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-[#111214] border border-gray-600">
                <DropdownMenuItem
                    className="hover:cursor-pointer"
                    onClick={() => setIsEditing(true)}>
                    メッセージを編集
                </DropdownMenuItem>
                <div className="px-2 py-1.5">
                    <MessageDeleteDialog
                        useOperationMessageCustomHook={
                            useOperationMessageCustomHook
                        }
                        created_at={created_at}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const MessageDeleteDialog = ({ useOperationMessageCustomHook, created_at }) => {
    const { handleDeleteMessage } = useOperationMessageCustomHook()

    return (
        <Dialog>
            <DialogTrigger className="w-full flex items-center justify-center">
                <span className="text-sm text-red-600 hover:cursor-pointer">
                    メッセージを削除
                </span>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>メッセージを削除しますか？</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose>
                        <Button
                            onClick={() => handleDeleteMessage(created_at)}
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 hover:cursor-pointer">
                            削除
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
