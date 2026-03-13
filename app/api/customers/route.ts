import { NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';

// GET - Read all customers
export async function GET() {
  try {
    const snapshot = await db.collection(COLLECTIONS.CUSTOMERS).get();
    const customers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST - Add new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const docRef = await db.collection(COLLECTIONS.CUSTOMERS).add({
      firstName: body.firstName,
      lastName: body.lastName || '',
      customerCode: body.customerCode,
      reference1: body.reference1 || body.customerCode, // Reference 1 = รหัสลูกค้า
      reference2: body.reference2 || '000000000', // Reference 2 = 000000000
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const newCustomer = {
      id: docRef.id,
      firstName: body.firstName,
      lastName: body.lastName || '',
      customerCode: body.customerCode,
      reference1: body.reference1 || body.customerCode,
      reference2: body.reference2,
    };

    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error('Failed to add customer:', error);
    return NextResponse.json({ error: 'Failed to add customer' }, { status: 500 });
  }
}

// PUT - Update customer
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    await db.collection(COLLECTIONS.CUSTOMERS).doc(body.id.toString()).update({
      firstName: body.firstName,
      lastName: body.lastName || '',
      customerCode: body.customerCode,
      reference1: body.reference1 || body.customerCode,
      reference2: body.reference2,
      updatedAt: new Date().toISOString(),
    });

    const updatedCustomer = {
      id: body.id,
      firstName: body.firstName,
      lastName: body.lastName || '',
      customerCode: body.customerCode,
      reference1: body.reference1,
      reference2: body.reference2,
    };

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE - Delete customer
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    await db.collection(COLLECTIONS.CUSTOMERS).doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
