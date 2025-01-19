import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

const DEFAULT_SETTINGS = {
  tempLimitReboot: false,
  voltageLimitReboot: false,
  notificationsEnabled: false,
  emergencyAlertsEnabled: false,
  action: 'notify',
  logRetention: '30',
  tempMax: 85,
  voltageMax: 5
};

export async function GET() {
  try {
    const settingsDoc = await db.collection('settings').doc('system').get();
    
    if (!settingsDoc.exists) {
      // If no settings exist, create default settings
      await db.collection('settings').doc('system').set(DEFAULT_SETTINGS);
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(settingsDoc.data());
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const settings = await req.json();
    
    await db.collection('settings').doc('system').set(settings, { merge: true });
    
    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}