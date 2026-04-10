import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if pharmacist exists
    const existingUser = await prisma.pharmacist.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pharmacist = await prisma.pharmacist.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: 'Pharmacist registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const pharmacist = await prisma.pharmacist.findUnique({ where: { email } });
    if (!pharmacist) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, pharmacist.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: pharmacist.id, email: pharmacist.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: pharmacist.id, name: pharmacist.name, email: pharmacist.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
