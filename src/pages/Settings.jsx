import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Settings Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              Application configuration and user preferences will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
