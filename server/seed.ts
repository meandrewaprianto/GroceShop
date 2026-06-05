import { prisma } from "./config/prisma.js"
import { Prisma } from "./generated/prisma/client.js";

const seedDB = async () => {
    try {
        // Clear existing data in order
        await prisma.review.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.deliveryPartner.deleteMany({});
        await prisma.address.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.user.deleteMany({});
        
        console.log("Cleared existing data")

        // Create users first (we need user IDs for reviews)
        const users = await prisma.user.createMany({
            data: [
                {
                    name: "Andrew Aprianto",
                    email: "andrew@example.com",
                    password: "$2b$10$YourHashedPasswordHere1", // Replace with actual bcrypt hash
                    phone: "081234567890",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andrew"
                },
                {
                    name: "Budi Santoso",
                    email: "budi@example.com",
                    password: "$2b$10$YourHashedPasswordHere2",
                    phone: "081234567891",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi"
                },
                {
                    name: "Siti Nurhaliza",
                    email: "siti@example.com",
                    password: "$2b$10$YourHashedPasswordHere3",
                    phone: "081234567892",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti"
                },
                {
                    name: "Admin User",
                    email: "admin@groceshop.com",
                    password: "$2b$10$YourHashedPasswordHere4", // Use bcrypt to hash "password123"
                    phone: "081234567893",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                }
            ]
        });

        // Get all users for review creation
        const allUsers = await prisma.user.findMany();
        
        console.log(`Created ${allUsers.length} users`)

        // Create products
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
                rating: 0,
                reviewCount: 0,
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
                rating: 0,
                reviewCount: 0,
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
                rating: 0,
                reviewCount: 0,
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
                rating: 0,
                reviewCount: 0,
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
                rating: 0,
                reviewCount: 0,
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
                rating: 0,
                reviewCount: 0,
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
                rating: 0,
                reviewCount: 0,
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
                rating: 0,
                reviewCount: 0,
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
                rating: 0,
                reviewCount: 0,
            },
        ]

        await prisma.product.createMany({ data: products })
        console.log(`Created ${products.length} products`)

        // Get all products for review creation
        const allProducts = await prisma.product.findMany();

        // Create reviews (each user can review each product once)
        const reviews = []
        const comments = [
            "Absolutely love this product! Fresh and great quality. Will definitely order again.",
            "Good value for the price. Packaging was neat and delivery was on time.",
            "Quality is decent but I expected it to be a bit fresher. Still a solid buy overall.",
            "This has become a staple in my kitchen now. Highly recommended for everyone!",
            "Exceeded my expectations. The taste and freshness were top-notch. Five stars!",
            "Pretty good! Not the absolute best I've had, but definitely worth the price.",
            "Arrived in perfect condition. Very satisfied with the purchase, ordering more soon.",
            "Great product, my family loved it. The organic quality really shows in the taste.",
        ]

        // Create some sample reviews (not all combinations, just a few for demo)
        const reviewData = [
            // Andrew reviews some products
            { userId: allUsers[0].id, productId: allProducts[0].id, rating: 5, comment: comments[0] },
            { userId: allUsers[0].id, productId: allProducts[1].id, rating: 4, comment: comments[1] },
            { userId: allUsers[0].id, productId: allProducts[2].id, rating: 5, comment: comments[3] },
            
            // Budi reviews some products
            { userId: allUsers[1].id, productId: allProducts[0].id, rating: 4, comment: comments[2] },
            { userId: allUsers[1].id, productId: allProducts[3].id, rating: 5, comment: comments[4] },
            { userId: allUsers[1].id, productId: allProducts[4].id, rating: 3, comment: comments[5] },
            
            // Siti reviews some products
            { userId: allUsers[2].id, productId: allProducts[0].id, rating: 5, comment: comments[6] },
            { userId: allUsers[2].id, productId: allProducts[5].id, rating: 4, comment: comments[7] },
            { userId: allUsers[2].id, productId: allProducts[1].id, rating: 5, comment: comments[0] },
        ]

        for (const review of reviewData) {
            await prisma.review.create({
                data: review
            })
            reviews.push(review)
        }

        console.log(`Created ${reviews.length} reviews`)

        // Update product ratings and review counts
        for (const product of allProducts) {
            const productReviews = await prisma.review.findMany({
                where: { productId: product.id },
                select: { rating: true }
            })

            if (productReviews.length > 0) {
                const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0)
                const averageRating = totalRating / productReviews.length

                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        rating: Math.round(averageRating * 10) / 10,
                        reviewCount: productReviews.length
                    }
                })
            }
        }

        console.log("Updated product ratings and review counts")

        // Create delivery partner
        await prisma.deliveryPartner.create({
            data: {
                name: "Ojek Online",
                email: "ojek@groceshop.com",
                password: "$2b$10$YourHashedPasswordHere5",
                phone: "081234567894",
                vehicleType: "bike",
                isActive: true
            }
        })

        console.log("Created delivery partner")

        console.log("✅ Seed completed successfully!")
        console.log("\n📝 Sample accounts:")
        console.log("   - Admin: admin@groceshop.com (password: password123)")
        console.log("   - User: andrew@example.com")
        console.log("   - User: budi@example.com")
        console.log("   - User: siti@example.com")
        console.log("\n⚠️  Note: You need to set proper bcrypt hashed passwords!")
        
        process.exit(0);
    } catch (error) {
        console.log("Seed error:", error)
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedDB();