import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coins, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Transaction } from '@/types/database';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (filter !== 'all') {
          query = query.eq('type', filter);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Explicitly cast data to Transaction[] type
        setTransactions((data || []) as Transaction[]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(Math.abs(amount));
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'win':
        return 'bg-green-500 text-white';
      case 'bet':
        return 'bg-red-500 text-white';
      case 'purchase':
        return 'bg-blue-500 text-white';
      case 'reward':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCurrencyType = (transaction: Transaction) => {
    if (transaction.metadata?.currency_type) {
      return transaction.metadata.currency_type === 'waynebucks' ? 'WayneBucks' : 'WayneSweeps';
    }
    return 'WayneBucks'; // Default
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Transaction History
            </CardTitle>
            <CardDescription>View your recent financial activity</CardDescription>
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="win">Winnings</SelectItem>
              <SelectItem value="bet">Bets</SelectItem>
              <SelectItem value="purchase">Purchases</SelectItem>
              <SelectItem value="reward">Rewards</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading transactions...
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>
                      <Badge className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.game || '-'}</TableCell>
                    <TableCell className={transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        <span>{transaction.amount > 0 ? '+' : '-'}{formatAmount(transaction.amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCurrencyType(transaction)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found. Play some games or make a purchase to see your history!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
