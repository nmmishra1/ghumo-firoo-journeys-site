import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Profile = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <p className="text-gray-600 mb-6">
              The user profile system is currently under maintenance. Please check back later.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
