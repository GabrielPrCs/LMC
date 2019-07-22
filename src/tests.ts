import { Tests as ModelTests } from './tests/model';
import { Tests as CollectionTests } from './tests/collection';
import { Tests as PaginatedCollectionTests } from './tests/paginated-collection';
import { Tests as IntegrationTests } from './tests/integration';

(async function () {
    let passed = 0;
    let failed = 0;

    const runner = async battery => {
        for (let i = 0; i < battery.length; i++) {
            try {
                const test = battery[i];
                console.log("\x1b[0m", '[Testing]', test.title);
                if (test.description) console.log("\x1b[0m", '[Description]', test.description);

                await test.handler();

                console.log("\x1b[32m", "OK");
                passed++;
            } catch (error) {
                console.log("\x1b[31m", "FAIL");
                console.log("\x1b[31m", error);
                console.log("\x1b[31m", error.stack);
                failed++;
            }
            console.log();
        }
    };

    console.log('--------------------------------------------------');
    console.log('- Model tests:                                   -');
    console.log('--------------------------------------------------');
    await runner(ModelTests);

    console.log('--------------------------------------------------');
    console.log('- Collection tests:                              -');
    console.log('--------------------------------------------------');
    await runner(CollectionTests);

    console.log('--------------------------------------------------');
    console.log('- Paginated collection tests:                    -');
    console.log('--------------------------------------------------');
    await runner(PaginatedCollectionTests);

    console.log('--------------------------------------------------');
    console.log('- Integration tests:                             -');
    console.log('--------------------------------------------------');
    await runner(IntegrationTests);

    console.log();
    console.log("\x1b[0m", '--------------------------------------------------');
    console.log("\x1b[0m", '- Results:                                       -');
    console.log("\x1b[0m", '--------------------------------------------------');
    console.log("\x1b[0m", 'Total tests:', passed + failed);
    console.log("\x1b[0m", 'Passed tests:', passed);
    console.log("\x1b[0m", 'Failed tests:', failed);
})();