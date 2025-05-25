<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useMessageStore } from "../../store/message";
import { socketService } from "../../services/socket.service";
import ChatHeader from "./ChatHeader.vue";
import MessagesList from "./MessagesList.vue";
import ChatInput from "./ChatInput.vue";

const props = defineProps<{
  conversationId: string;
  recipient: any;
}>();

const messageStore = useMessageStore();
const messagesListRef = ref<InstanceType<typeof MessagesList> | null>(null);

function handleIncomingMessage(msg: any) {
  if (msg.conversationId === props.conversationId) {
    messageStore.addMessage(msg);
    nextTick().then(() => {
      messagesListRef.value?.scrollToBottom();
    });
  }
}

function handleMessageSent() {
  nextTick().then(() => {
    messagesListRef.value?.scrollToBottom();
  });
}

onMounted(() => {
  socketService.joinConversation(props.conversationId);
  socketService.on("new_message", handleIncomingMessage);
});

onUnmounted(() => {
  socketService.off("new_message", handleIncomingMessage);
  messageStore.clearMessages();
});
</script>

<template>
  <div
    class="flex flex-col flex-1 bg-white dark:bg-gray-900 h-full overflow-hidden shadow-xl border-gray-200 dark:border-gray-700"
  >
    <ChatHeader :recipient="recipient" />

    <MessagesList 
      ref="messagesListRef"
      :conversation-id="conversationId" 
      :recipient="recipient" 
    />

    <ChatInput 
      :conversation-id="conversationId" 
      @message-sent="handleMessageSent"
    />
  </div>
</template>

<style scoped>
* {
  font-family: "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica,
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

