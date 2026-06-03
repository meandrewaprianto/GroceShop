import { prisma } from "./config/prisma.js"
import { Prisma } from "./generated/prisma/client.js";

const seedDB = async () => {
    try {
        await prisma.product.deleteMany({});
        console.log("Cleared existing product")

        const products: Prisma.ProductCreateManyInput[] = [
            {
                name: "Butter Croissant 100g",
                description: "Flaky and buttery",
                price: 45,
                originalPrice: 50,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/zvoeqbvrbrt7atqj0dbu.png",
                category: "bakery",
                unit: "100g",
                stock: 100,
                isOrganic: false,
                rating: 3.5,
                reviewCount: 12,
            },
            {

                name: "Organic Quinoa 500g",
                description: "High protein, Gluten-free",
                price: 420,
                originalPrice: 450,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/cxrrgnf12xuhkr4dyhi2.png",
                category: "pantry-staples",
                unit: "500g",
                stock: 100,
                isOrganic: true,
                rating: 4.5,
                reviewCount: 12,
            },
            {
                name: "Brown Bread 400g",
                description: "Soft and healthy, Ideal for breakfast",
                price: 35,
                originalPrice: 40,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/vy1xa7zovcu22smzapzv.png",
                category: "bakery",
                unit: "400g",
                stock: 100,
                isOrganic: false,
                rating: 4.5,
                reviewCount: 12,
            },
            {

                name: "Barley 1kg",
                description: "Rich in fiber, Helps digestion",
                price: 140,
                originalPrice: 150,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/spb5sgy8g24rned9nwog.png",
                category: "pantry-staples",
                unit: "1kg",
                stock: 100,
                isOrganic: false,
                rating: 4.5,
                reviewCount: 12,
            },
            {

                name: "Knorr Cup Soup 70g",
                description: "Convenient and tasty",
                price: 30,
                originalPrice: 35,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/vnzb2qbwtpab5gnqvx0f.png",
                category: "pantry-staples",
                unit: "70g",
                stock: 100,
                isOrganic: false,
                rating: 4.5,
                reviewCount: 12,
            },
            {
                name: "Maggi Noodles 280g",
                description: "Instant and easy to cook",
                price: 50,
                originalPrice: 55,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/dsep7owmwvfrukzbslqo.png",
                category: "pantry-staples",
                unit: "280g",
                stock: 100,
                isOrganic: false,
                rating: 4.5,
                reviewCount: 12,
            },
            {

                name: "Sprite 1.5L",
                description: "Chilled and refreshing, Perfect for celebrations",
                price: 60,
                originalPrice: 75,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/daiglpvgna1dlhjplbve.png",
                category: "beverages",
                unit: "1.5L",
                stock: 100,
                isOrganic: false,
                rating: 4.5,
                reviewCount: 12,
            },
            {

                name: "Carrot 500g",
                description: "Sweet and crunchy, Good for eyesight, Ideal for juices and salads",
                price: 44,
                originalPrice: 50,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/ceqgisupuizyste9aifg.png",
                category: "fruits-vegetables",
                unit: "500g",
                stock: 100,
                isOrganic: true,
                rating: 4.5,
                reviewCount: 12,
            },
            {
                name: "Coca-Cola 1.5L",
                description: "Perfect for parties and gatherings, Best served chilled",
                price: 75,
                originalPrice: 80,
                image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/eljxcdud6fduwfim5rdx.png",
                category: "beverages",
                unit: "1.5L",
                stock: 100,
                isOrganic: false,
                rating: 4.5,
                reviewCount: 12,
            },

        ]

        await prisma.product.createMany({ data: products })
        console.log(`Created ${products.length} product`)

        console.log("Seed completed successfully")
        process.exit(0);
    } catch (error) {
        console.log("Seed error:", error)
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedDB();