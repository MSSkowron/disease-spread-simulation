import { toast } from 'react-toastify'
import { type Scene } from '../scenes/Scene'
import {
    OutcomingTradeMessageType,
    sendTradeMessage,
} from '../webSocketMessage/chat/TradeMessageHandler'
import { TOAST_INVITE_MSG, TOAST_INVITE_MSG_COOP } from '../GameUtils'
import {
    OutcomingCoopMessageType,
    sendCoopMessage,
} from '../webSocketMessage/chat/CoopMessageHandler'

export class ContextMenuBuilder {
    private static readonly buttonPartnershipWrapperID = 'buttonPartnershipWrapper'
    private static readonly buttonTradeWrapperID = 'buttonTradeWrapper'
    private static readonly buttonsWrapperID = 'buttonsWrapper'
    private static readonly buttonWithCloudID = 'buttonWithCloud'
    private static readonly cityCloudID = 'cityCloud'

    build(scene: Scene, id: string): HTMLDivElement {
        const div = document.createElement('div')
        div.id = 'btns'
        div.style.backgroundColor = 'transparent'
        const divInside = document.createElement('div')
        divInside.id = ContextMenuBuilder.buttonsWrapperID

        if (
            scene.plannedTravel &&
            scene.plannedTravel.travel.value.name === scene.playerAdvertisedTravel[id]
        ) {
            const otherTravel = document.createElement('div')
            otherTravel.id = ContextMenuBuilder.buttonWithCloudID
            const buttonGetIntoPartnership = document.createElement('button')
            buttonGetIntoPartnership.style.width = '50px'
            buttonGetIntoPartnership.style.height = '45px'
            const imgGetIntoPartnership = document.createElement('img')
            imgGetIntoPartnership.src = '/assets/coopCustomIcon.png'
            imgGetIntoPartnership.style.width = '35px'
            buttonGetIntoPartnership.appendChild(imgGetIntoPartnership)
            buttonGetIntoPartnership.onclick = (_: Event) => {
                window.document.getElementById('btns')?.remove()
                scene.actionTrade = null

                sendCoopMessage(scene.chatWs, {
                    type: OutcomingCoopMessageType.ProposeOwnTravel,
                    travelName: scene.plannedTravel!.travel.value.name,
                    guestId: id,
                })
                this.coopInviteConfirmation()
            }
            const cityCloud = document.createElement('div')
            cityCloud.id = ContextMenuBuilder.cityCloudID
            const cityText = document.createElement('h3')
            cityText.textContent = scene.playerAdvertisedTravel[id]
            cityCloud.appendChild(cityText)
            otherTravel.appendChild(cityCloud)
            const buttonGetIntoPartnershipWrapper = document.createElement('div')
            buttonGetIntoPartnershipWrapper.id = ContextMenuBuilder.buttonPartnershipWrapperID
            buttonGetIntoPartnershipWrapper.appendChild(buttonGetIntoPartnership)
            otherTravel.appendChild(buttonGetIntoPartnershipWrapper)
            divInside.appendChild(otherTravel)
        } else {
            if (scene.plannedTravel) {
                const buttonProposePartnership = document.createElement('button')
                buttonProposePartnership.style.width = '50px'
                buttonProposePartnership.style.height = '45px'
                const imgProposePartnership = document.createElement('img')
                imgProposePartnership.src = '/assets/coopCustomIcon.png'
                imgProposePartnership.style.width = '35px'
                if (scene.playerAdvertisedTravel[id]) {
                    imgProposePartnership.src = '/assets/coopProposeCustomIcon.png'
                    imgProposePartnership.style.width = '25px'
                }
                buttonProposePartnership.appendChild(imgProposePartnership)
                buttonProposePartnership.onclick = (_: Event) => {
                    window.document.getElementById('btns')?.remove()
                    scene.actionTrade = null

                    sendCoopMessage(scene.chatWs, {
                        type: OutcomingCoopMessageType.ProposeOwnTravel,
                        travelName: scene.plannedTravel!.travel.value.name,
                        guestId: id,
                    })
                    this.coopInviteConfirmation()
                }
                const buttonProposePartnershipWrapper = document.createElement('div')
                buttonProposePartnershipWrapper.id = ContextMenuBuilder.buttonPartnershipWrapperID
                buttonProposePartnershipWrapper.appendChild(buttonProposePartnership)
                divInside.appendChild(buttonProposePartnershipWrapper)
            }

            if (scene.playerAdvertisedTravel[id]) {
                const otherTravel = document.createElement('div')
                otherTravel.id = ContextMenuBuilder.buttonWithCloudID
                const buttonGetIntoPartnership = document.createElement('button')
                buttonGetIntoPartnership.style.width = '50px'
                buttonGetIntoPartnership.style.height = '45px'
                const imgGetIntoPartnership = document.createElement('img')
                imgGetIntoPartnership.src = '/assets/coopCustomIcon.png'
                imgGetIntoPartnership.style.width = '35px'
                if (scene.plannedTravel) {
                    imgGetIntoPartnership.src = '/assets/coopJoinCustomIcon.png'
                    imgGetIntoPartnership.style.width = '25px'
                }
                buttonGetIntoPartnership.appendChild(imgGetIntoPartnership)
                buttonGetIntoPartnership.onclick = (_: Event) => {
                    window.document.getElementById('btns')?.remove()
                    scene.actionTrade = null
                    if (scene.playerAdvertisedTravel[id] !== undefined) {
                        if (scene.plannedTravel) {
                            sendCoopMessage(scene.chatWs, {
                                type: OutcomingCoopMessageType.GatheringJoinPlanning,
                                ownerId: id,
                            })
                        } else {
                            sendCoopMessage(scene.chatWs, {
                                type: OutcomingCoopMessageType.SimpleJoinPlanning,
                                ownerId: id,
                            })
                        }
                        this.coopInviteConfirmation()
                    }
                }
                const cityCloud = document.createElement('div')
                cityCloud.id = ContextMenuBuilder.cityCloudID
                const cityText = document.createElement('h3')
                cityText.textContent = scene.playerAdvertisedTravel[id]
                cityCloud.appendChild(cityText)
                otherTravel.appendChild(cityCloud)
                const buttonGetIntoPartnershipWrapper = document.createElement('div')
                buttonGetIntoPartnershipWrapper.id = ContextMenuBuilder.buttonPartnershipWrapperID
                buttonGetIntoPartnershipWrapper.appendChild(buttonGetIntoPartnership)
                otherTravel.appendChild(buttonGetIntoPartnershipWrapper)
                divInside.appendChild(otherTravel)
            }
        }

        const buttonTrade = document.createElement('button')
        buttonTrade.style.width = '50px'
        buttonTrade.style.height = '45px'
        const imgTrade = document.createElement('img')
        imgTrade.src = '/assets/tradeCustomIcon.png'
        imgTrade.style.width = '25px'
        buttonTrade.appendChild(imgTrade)
        buttonTrade.onclick = (_: Event) => {
            window.document.getElementById('btns')?.remove()
            sendTradeMessage(scene.chatWs, {
                type: OutcomingTradeMessageType.ProposeTrade,
                proposalReceiverId: id,
            })
            toast(TOAST_INVITE_MSG, {
                position: 'bottom-right',
                autoClose: 3000,
                hideProgressBar: true,
                closeButton: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            })
            scene.actionTrade = null
        }
        const buttonTradeWrapper = document.createElement('div')
        buttonTradeWrapper.id = ContextMenuBuilder.buttonTradeWrapperID
        buttonTradeWrapper.appendChild(buttonTrade)
        divInside.appendChild(buttonTradeWrapper)

        div.appendChild(divInside)

        return div
    }

    coopInviteConfirmation(): void {
        toast(TOAST_INVITE_MSG_COOP, {
            position: 'bottom-right',
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
        })
    }
}
