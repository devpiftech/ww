
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  game?: string;
  created_at: string;
}

interface User {
  id: string;
  username: string;
}

interface TransactionsTabProps {
  transactions: Transaction[];
  users: User[];
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions, users }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>View all casino transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {users.find(u => u.id === transaction.user_id)?.username || transaction.user_id.substring(0, 8)}
                    </TableCell>
                    <TableCell className={transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'win' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.game || 'N/A'}</TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No transactions found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsTab;
