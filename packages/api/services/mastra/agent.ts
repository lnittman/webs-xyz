import 'server-only';

// Types
export interface AgentChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentResponse {
  text: string;
  toolCalls?: any[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Service class for Mastra agent operations
export class MastraAgentService {
  private mastraUrl: string;

  constructor() {
    this.mastraUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';
  }

  /**
   * Send a message to an agent
   */
  async sendMessage(agentId: string, messages: AgentChatMessage[]): Promise<AgentResponse> {
    try {
      const response = await fetch(`${this.mastraUrl}/api/agents/${agentId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to generate agent response: ${error}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[MastraAgent] Error sending message to ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Stream a message to an agent
   */
  async streamMessage(agentId: string, messages: AgentChatMessage[]): Promise<Response> {
    const response = await fetch(`${this.mastraUrl}/api/agents/${agentId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Failed to stream agent response: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Get agent information
   */
  async getAgent(agentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.mastraUrl}/api/agents/${agentId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get agent info: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[MastraAgent] Error getting agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * List available agents
   */
  async listAgents(): Promise<any[]> {
    try {
      const response = await fetch(`${this.mastraUrl}/api/agents`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list agents: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[MastraAgent] Error listing agents:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const mastraAgentService = new MastraAgentService(); 