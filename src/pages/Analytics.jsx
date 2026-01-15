import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Analytics Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              Advanced analytics and behavioral pattern analysis will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
