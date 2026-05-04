import React from 'react';
import { ProviderIcon } from './provider-icon';

export function ProviderIconDemo() {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Provider Icons Demo</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">OpenAI:</span>
          <ProviderIcon provider="OPENAI" model="gpt-4o-mini" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Google:</span>
          <ProviderIcon provider="GOOGLE" model="gemini-2.5-flash" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Anthropic:</span>
          <ProviderIcon provider="ANTHROPIC" model="claude-3-5-sonnet" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Unknown:</span>
          <ProviderIcon provider="UNKNOWN" model="custom-model" />
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Different Sizes:</h4>
        <div className="flex items-center gap-4">
          <ProviderIcon provider="OPENAI" model="gpt-4o" size="sm" />
          <ProviderIcon provider="GOOGLE" model="gemini-2.5-flash" size="md" />
          <ProviderIcon provider="ANTHROPIC" model="claude-3-5-sonnet" size="lg" />
        </div>
      </div>
    </div>
  );
}
