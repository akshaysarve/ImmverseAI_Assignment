export interface Transaction {
  id: number;
  accountId: number;
  type: 'Credit' | 'Debit';
  date: number;
  amount: number;
  description: string;
}