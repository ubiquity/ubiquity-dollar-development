import { Transaction } from "./common/types";
import { useConnectedContext } from "./context/connected";
import { Spinner } from "./ui/widget";

export const Transacting = (props: { transaction: Transaction }): JSX.Element | null => {
  if (!props.transaction.active) {
    return null;
  }
  return (
    <div className="mt-1 rounded-full border border-solid border-accent bg-accent bg-opacity-10 py-1 px-4 text-accent">
      {props.transaction.title} {Spinner}
    </div>
  );
};

const TransactionsDisplay = () => {
  const { activeTransactions } = useConnectedContext();

  return (
    <div className="pointer-events-none fixed top-0 right-0 mr-4 mt-4">
      {activeTransactions.map((transaction, index) => (
        <Transacting key={transaction.id + index} transaction={transaction} />
      ))}
    </div>
  );
};

export default TransactionsDisplay;
