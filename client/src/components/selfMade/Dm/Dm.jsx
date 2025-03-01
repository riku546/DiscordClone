import React from 'react'
import DmListAndUserFiled from './DmListAndUserFiled/DmListAndUserFiled'
import MessageContent from '../MessageContent'
import ServerList from './ServerList/ServerList'

const Dm = ({ fetchDmMessage, messages, setMessages, dmId }) => {
    return (
        <div className="flex h-screen bg-[#313338] text-gray-100">
            <ServerList></ServerList>
            <DmListAndUserFiled fetchDmMessage={fetchDmMessage} />
            <div className="flex-1">
                <MessageContent
                    messages={messages}
                    setMessages={setMessages}
                    messageType={'dm'}
                    id={dmId}
                />
            </div>
        </div>
    )
}



export default Dm
