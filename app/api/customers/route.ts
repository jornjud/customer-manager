import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import { commitToGitHub, isGitHubConfigured } from '@/lib/github';

const dataFilePath = path.join(process.cwd(), 'data', 'customers.json');

// GET - Read all customers
export async function GET() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const customers = JSON.parse(data);
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read customers' }, { status: 500 });
  }
}

// POST - Add new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const customers = JSON.parse(data);
    
    const newId = customers.length > 0 
      ? Math.max(...customers.map((c: any) => c.id)) + 1 
      : 1;
    
    const newCustomer = {
      id: newId,
      firstName: body.firstName,
      lastName: body.lastName || '',
      customerCode: body.customerCode,
    };
    
    customers.push(newCustomer);
    await fs.writeFile(dataFilePath, JSON.stringify(customers, null, 2), 'utf-8');
    
    // Commit to GitHub if configured
    if (isGitHubConfigured()) {
      try {
        await commitToGitHub(
          'data/customers.json',
          JSON.stringify(customers, null, 2),
          `➕ Add customer: ${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.customerCode})`
        );
      } catch (githubError) {
        console.error('GitHub commit failed:', githubError);
      }
    }
    
    return NextResponse.json(newCustomer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add customer' }, { status: 500 });
  }
}

// PUT - Update customer
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const data = await fs.readFile(dataFilePath, 'utf-8');
    let customers = JSON.parse(data);
    
    const index = customers.findIndex((c: any) => c.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const oldCustomer = customers[index];
    customers[index] = {
      id: body.id,
      firstName: body.firstName,
      lastName: body.lastName || '',
      customerCode: body.customerCode,
    };
    
    await fs.writeFile(dataFilePath, JSON.stringify(customers, null, 2), 'utf-8');
    
    // Commit to GitHub if configured
    if (isGitHubConfigured()) {
      try {
        await commitToGitHub(
          'data/customers.json',
          JSON.stringify(customers, null, 2),
          `✏️ Update customer: ${body.firstName} ${body.lastName} (${body.customerCode})`
        );
      } catch (githubError) {
        console.error('GitHub commit failed:', githubError);
      }
    }
    
    return NextResponse.json(customers[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE - Delete customer
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    const data = await fs.readFile(dataFilePath, 'utf-8');
    let customers = JSON.parse(data);
    
    const deletedCustomer = customers.find((c: any) => c.id === id);
    const filtered = customers.filter((c: any) => c.id !== id);
    if (filtered.length === customers.length) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    await fs.writeFile(dataFilePath, JSON.stringify(filtered, null, 2), 'utf-8');
    
    // Commit to GitHub if configured
    if (isGitHubConfigured() && deletedCustomer) {
      try {
        await commitToGitHub(
          'data/customers.json',
          JSON.stringify(filtered, null, 2),
          `🗑️ Delete customer: ${deletedCustomer.firstName} ${deletedCustomer.lastName} (${deletedCustomer.customerCode})`
        );
      } catch (githubError) {
        console.error('GitHub commit failed:', githubError);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
