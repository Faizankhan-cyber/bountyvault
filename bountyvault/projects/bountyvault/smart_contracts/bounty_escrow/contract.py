from algopy import ARC4Contract, GlobalState, arc4, itxn, Txn


class BountyEscrow(ARC4Contract):
    poster: GlobalState[arc4.Address]
    admin: GlobalState[arc4.Address]
    reward: GlobalState[arc4.UInt64]

    def __init__(self) -> None:
        self.poster = GlobalState(arc4.Address)
        self.admin = GlobalState(arc4.Address)
        self.reward = GlobalState(arc4.UInt64)

    @arc4.abimethod()
    def post_bounty(self) -> None:
        self.poster.value = arc4.Address(Txn.sender)
        self.reward.value = arc4.UInt64(Txn.amount)
        self.admin.value = arc4.Address(Txn.sender)

    @arc4.abimethod()
    def release_payment(self, worker: arc4.Address) -> None:
        assert Txn.sender == self.admin.get(arc4.Address()).native
        itxn.Payment(
            receiver=worker.native,
            amount=self.reward.get(arc4.UInt64(0)).native
        ).submit()

    @arc4.abimethod()
    def cancel_bounty(self) -> None:
        assert Txn.sender == self.admin.get(arc4.Address()).native

        itxn.Payment(
            receiver=self.poster.get(arc4.Address()).native,
            amount=self.reward.get(arc4.UInt64(0)).native
        ).submit()

    @arc4.abimethod()
    def resolve_dispute(self, recipient: arc4.Address, decision: arc4.String) -> None:
        assert Txn.sender == self.admin.get(arc4.Address()).native

        itxn.Payment(
            receiver=recipient.native,
            amount=self.reward.get(arc4.UInt64(0)).native
        ).submit()