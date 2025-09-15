/**
 * Example Prompts Implementation
 */

import { Prompt } from '../types/index.js';

export const examplePrompts: Prompt[] = [
  {
    name: "code_review",
    description: "Perform a code review on the provided code",
    arguments: [
      {
        name: "code",
        description: "The code to review",
        required: true
      },
      {
        name: "language",
        description: "Programming language of the code",
        required: false
      },
      {
        name: "focus",
        description: "Specific aspects to focus on (security, performance, style, etc.)",
        required: false
      }
    ]
  },
  {
    name: "explain_concept",
    description: "Explain a technical concept in simple terms",
    arguments: [
      {
        name: "concept",
        description: "The concept to explain",
        required: true
      },
      {
        name: "audience",
        description: "Target audience (beginner, intermediate, expert)",
        required: false
      },
      {
        name: "examples",
        description: "Include practical examples (true/false)",
        required: false
      }
    ]
  },
  {
    name: "debug_help",
    description: "Help debug a problem or error",
    arguments: [
      {
        name: "error",
        description: "The error message or problem description",
        required: true
      },
      {
        name: "context",
        description: "Additional context about when the error occurs",
        required: false
      },
      {
        name: "code",
        description: "Relevant code snippet",
        required: false
      }
    ]
  },
  {
    name: "write_docs",
    description: "Generate documentation for code or API",
    arguments: [
      {
        name: "subject",
        description: "What to document (function, class, API endpoint, etc.)",
        required: true
      },
      {
        name: "style",
        description: "Documentation style (JSDoc, Sphinx, etc.)",
        required: false
      },
      {
        name: "include_examples",
        description: "Include usage examples",
        required: false
      }
    ]
  }
];

export class PromptProvider {
  static generatePrompt(name: string, args: Record<string, string>): string {
    switch (name) {
      case 'code_review':
        return this.generateCodeReviewPrompt(args);
      case 'explain_concept':
        return this.generateExplainConceptPrompt(args);
      case 'debug_help':
        return this.generateDebugHelpPrompt(args);
      case 'write_docs':
        return this.generateWriteDocsPrompt(args);
      default:
        return `Please help with the ${name} task using these parameters: ${JSON.stringify(args)}`;
    }
  }

  private static generateCodeReviewPrompt(args: Record<string, string>): string {
    const { code, language, focus } = args;
    let prompt = `Please review the following ${language || 'code'}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\n`;
    
    if (focus) {
      prompt += `Please focus specifically on: ${focus}\n\n`;
    }
    
    prompt += "Please provide feedback on:\n";
    prompt += "- Code quality and readability\n";
    prompt += "- Potential bugs or issues\n";
    prompt += "- Performance considerations\n";
    prompt += "- Best practices and conventions\n";
    prompt += "- Security considerations\n";
    prompt += "- Suggestions for improvement";
    
    return prompt;
  }

  private static generateExplainConceptPrompt(args: Record<string, string>): string {
    const { concept, audience, examples } = args;
    let prompt = `Please explain the concept of "${concept}"`;
    
    if (audience) {
      prompt += ` for a ${audience} audience`;
    }
    
    prompt += ".\n\n";
    prompt += "Please structure your explanation with:\n";
    prompt += "- A clear definition\n";
    prompt += "- Key characteristics or components\n";
    prompt += "- Why it's important or useful\n";
    
    if (examples === 'true') {
      prompt += "- Practical examples or use cases\n";
    }
    
    prompt += "- Common misconceptions (if any)";
    
    return prompt;
  }

  private static generateDebugHelpPrompt(args: Record<string, string>): string {
    const { error, context, code } = args;
    let prompt = `I'm encountering the following error:\n\n${error}\n\n`;
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }
    
    if (code) {
      prompt += `Relevant code:\n\`\`\`\n${code}\n\`\`\`\n\n`;
    }
    
    prompt += "Please help me:\n";
    prompt += "- Understand what's causing this error\n";
    prompt += "- Provide possible solutions\n";
    prompt += "- Suggest steps to prevent this in the future\n";
    prompt += "- Identify any related issues I should be aware of";
    
    return prompt;
  }

  private static generateWriteDocsPrompt(args: Record<string, string>): string {
    const { subject, style, include_examples } = args;
    let prompt = `Please write documentation for: ${subject}\n\n`;
    
    if (style) {
      prompt += `Please use ${style} format.\n\n`;
    }
    
    prompt += "Please include:\n";
    prompt += "- Clear description of purpose and functionality\n";
    prompt += "- Parameters and return values (if applicable)\n";
    prompt += "- Usage instructions\n";
    
    if (include_examples === 'true') {
      prompt += "- Code examples showing how to use it\n";
    }
    
    prompt += "- Any important notes or warnings\n";
    prompt += "- Related references or dependencies";
    
    return prompt;
  }
}