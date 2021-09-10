FOR /L %%A IN (101,1,200) DO (
    gh repo create yoonaoh-test-org/two-hundreds-%%A --confirm --public
)