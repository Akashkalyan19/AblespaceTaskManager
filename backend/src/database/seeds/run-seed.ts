import dataSource from '../data-source';
import { User } from '../../users/user.entity';
import { DEMO_MEMBERS } from '../demo-data';

/**
 * Seeds the shared demo member accounts (assignee options).
 * Guest sandboxes are cloned at login time by AuthService, so this script
 * only needs to run once per database (it is idempotent either way —
 * AuthService also creates missing members on demand).
 */
async function run() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);

  for (const member of DEMO_MEMBERS) {
    const existing = await users.findOne({ where: { email: member.email } });
    if (existing) {
      console.log(`= ${member.name} already exists`);
      continue;
    }
    await users.save(users.create({ ...member, isDemoMember: true }));
    console.log(`+ created ${member.name}`);
  }

  await dataSource.destroy();
  console.log('Seed complete.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
