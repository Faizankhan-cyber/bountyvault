import logging

import algokit_utils

logger = logging.getLogger(__name__)


# define deployment behaviour based on supplied app spec
def deploy() -> None:
    from smart_contracts.artifacts.bounty_escrow.bounty_escrow_client import (
        BountyEscrowFactory,
    )

    algorand = algokit_utils.AlgorandClient.testnet()
    from algosdk import mnemonic

    mnemonic_phrase = "share believe faint more extra shrug crazy south record life amateur fancy yellow play fine ginger glimpse hobby giraffe deal mushroom speak tackle abandon empower"
    private_key = mnemonic.to_private_key(mnemonic_phrase)

deployer_ = algorand.account.from_private_key(private_key)

    factory = algorand.client.get_typed_app_factory(
        BountyEscrowFactory, default_sender=deployer_.address
    )

    app_client, _ = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )
    logger.info(f"Deployed {app_client.app_name} ({app_client.app_id})")
