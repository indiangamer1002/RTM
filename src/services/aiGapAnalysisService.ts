import { UnlinkedItem, mockUnlinkedItems as initialItems } from '@/data/unlinkedItems';
import { requirementsData } from '@/data/mockData';
import { Requirement } from '@/types/rtm';

export interface AIRecommendation {
  itemId: string;
  recommendedReqId: string;
  reqTitle: string;
  reqNumber: string;
  score: number;
  reasoning: string;
}

export interface NewRequirementSuggestion {
  sourceItemId: string;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedType: string;
  suggestedPriority: string;
  reasoning: string;
}

// Simulate delay for "AI" processing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AIGapAnalysisService {
  private items: UnlinkedItem[] = [...initialItems];

  async getUnlinkedItems(): Promise<UnlinkedItem[]> {
    await delay(400); // Simulate network latency
    return [...this.items];
  }

  async getRecommendations(itemIds: string[]): Promise<AIRecommendation[]> {
    await delay(1500); // Simulate AI processing time

    const recommendations: AIRecommendation[] = [];
    const targetItems = this.items.filter(item => itemIds.includes(item.id));

    // Improved matching logic based on keywords in title and description
    targetItems.forEach(item => {
      let bestMatch: Requirement | undefined;
      let bestScore = 0;
      let reasoning = '';

      const searchText = `${item.title} ${item.description || ''}`.toLowerCase();

      // Score each requirement based on keyword matches
      requirementsData.forEach(req => {
        let score = 0;
        const reqText = `${req.title} ${req.description || ''}`.toLowerCase();
        
        // Extract keywords from both texts
        const itemKeywords = this.extractKeywords(searchText);
        const reqKeywords = this.extractKeywords(reqText);
        
        // Calculate match score based on shared keywords
        const sharedKeywords = itemKeywords.filter(k => reqKeywords.includes(k));
        if (sharedKeywords.length > 0) {
          score = Math.min(95, 40 + (sharedKeywords.length * 15));
        }

        // Boost score for specific keyword patterns
        if (searchText.includes('payment') || searchText.includes('gateway')) {
          if (reqText.includes('order') || reqText.includes('sales')) {
            score = Math.max(score, 88);
            reasoning = "Payment/gateway terms match with Sales Order workflows.";
          }
        }
        
        if (searchText.includes('dark mode') || searchText.includes('ui') || searchText.includes('color')) {
          if (reqText.includes('dashboard') || reqText.includes('status')) {
            score = Math.max(score, 92);
            reasoning = "UI/UX terms correlate with Dashboard functionality.";
          }
        }
        
        if (searchText.includes('login') || searchText.includes('auth')) {
          if (reqText.includes('onboarding') || reqText.includes('employee')) {
            score = Math.max(score, 75);
            reasoning = "Authentication patterns detected in onboarding context.";
          }
        }
        
        if (searchText.includes('invoice') || searchText.includes('pdf')) {
          if (reqText.includes('invoice')) {
            score = Math.max(score, 98);
            reasoning = "Direct keyword match with Invoice Generation requirement.";
          }
        }
        
        if (searchText.includes('database') || searchText.includes('index') || searchText.includes('performance')) {
          if (reqText.includes('production') || reqText.includes('planning')) {
            score = Math.max(score, 65);
            reasoning = "Technical optimization task related to production planning.";
          }
        }

        if (searchText.includes('security') || searchText.includes('audit')) {
          if (reqText.includes('close') || reqText.includes('financial')) {
            score = Math.max(score, 72);
            reasoning = "Security/audit requirements match financial period processes.";
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = req;
          if (!reasoning) {
            reasoning = `Matched based on ${sharedKeywords.length} shared keywords: "${sharedKeywords.slice(0, 3).join('", "')}"`;
          }
        }
      });

      // If no good match found, provide a random low-confidence match
      if (!bestMatch || bestScore < 30) {
        bestMatch = requirementsData[Math.floor(Math.random() * requirementsData.length)];
        bestScore = 20 + Math.floor(Math.random() * 25); // 20-45%
        reasoning = "Low confidence match. Consider creating a new requirement.";
      }

      recommendations.push({
        itemId: item.id,
        recommendedReqId: bestMatch.id,
        reqTitle: bestMatch.title,
        reqNumber: bestMatch.reqId,
        score: bestScore,
        reasoning: reasoning
      });
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  async suggestNewRequirements(itemIds: string[]): Promise<NewRequirementSuggestion[]> {
    await delay(1000); // Simulate AI processing

    const suggestions: NewRequirementSuggestion[] = [];
    const items = this.items.filter(item => itemIds.includes(item.id));

    items.forEach(item => {
      // Generate a suggested requirement based on the item
      const suggestion: NewRequirementSuggestion = {
        sourceItemId: item.id,
        suggestedTitle: this.generateRequirementTitle(item),
        suggestedDescription: this.generateRequirementDescription(item),
        suggestedType: this.inferRequirementType(item),
        suggestedPriority: item.priority,
        reasoning: `Generated from unlinked ${item.type.toLowerCase()} "${item.title}". No existing requirement matched with sufficient confidence.`
      };

      suggestions.push(suggestion);
    });

    return suggestions;
  }

  async createRequirements(suggestions: NewRequirementSuggestion[]): Promise<void> {
    await delay(1200); // Simulate creation time
    
    // In a real implementation, this would:
    // 1. Create new requirements in the database
    // 2. Link the source items to these new requirements
    // 3. Update the navigation tree
    
    // For now, just remove items from the unlinked list
    const sourceIds = suggestions.map(s => s.sourceItemId);
    this.items = this.items.filter(item => !sourceIds.includes(item.id));
    
    console.log('Created requirements for:', suggestions.map(s => s.suggestedTitle));
  }

  async linkItems(links: { itemId: string; reqId: string }[]): Promise<void> {
    await delay(800);
    // Remove linked items from the "unlinked" list to simulate success
    this.items = this.items.filter(item => !links.some(link => link.itemId === item.id));
  }

  // Helper methods
  private extractKeywords(text: string): string[] {
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 
      'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'for', 'with',
      'on', 'at', 'by', 'from', 'in', 'of', 'and', 'or', 'not', 'no', 'but', 'if', 'then',
      'else', 'when', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 
      'once', 'test', 'verify', 'check', 'ensure', 'that', 'this', 'these', 'those'];
    
    return text
      .split(/[\s,.;:!?()[\]{}'"]+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  private generateRequirementTitle(item: UnlinkedItem): string {
    // Clean up the item title and convert to requirement format
    const title = item.title
      .replace(/^(Test|Verify|Check|Ensure)\s+/i, '')
      .replace(/\s+(Test|Testing)$/i, '');
    
    // Add appropriate prefix based on type
    if (item.type === 'TestCase') {
      return `${title} Requirement`;
    } else if (item.type === 'Task') {
      return `${title}`;
    } else if (item.type === 'Issue') {
      return `Fix: ${title}`;
    } else if (item.type === 'SignOff') {
      return `${title} Process`;
    }
    
    return title;
  }

  private generateRequirementDescription(item: UnlinkedItem): string {
    const prefix = `This requirement covers the functionality related to: `;
    const description = item.description || item.title;
    return `${prefix}${description}`;
  }

  private inferRequirementType(item: UnlinkedItem): string {
    const text = `${item.title} ${item.description || ''}`.toLowerCase();
    
    if (text.includes('api') || text.includes('integration') || text.includes('database')) {
      return 'Technical';
    } else if (text.includes('user') || text.includes('ui') || text.includes('screen') || text.includes('form')) {
      return 'Functional';
    } else if (text.includes('business') || text.includes('workflow') || text.includes('process')) {
      return 'Business';
    }
    
    return 'Functional';
  }
}

export const aiGapAnalysisService = new AIGapAnalysisService();
