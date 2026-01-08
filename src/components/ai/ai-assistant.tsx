'use client';

import { EnhancedAIChat } from './enhanced-ai-chat';

// Re-export EnhancedAIChat as AIAssistant for backward compatibility
export function AIAssistant() {
    return (
        <EnhancedAIChat
            onSendMessage={async (message, mode) => ({
                id: Date.now().toString(),
                role: 'assistant' as const,
                content: 'Response placeholder',
                timestamp: new Date(),
            })}
        />
    );
}
