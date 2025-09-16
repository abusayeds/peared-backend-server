
import httpStatus from "http-status"
import queryBuilder from "../../../builder/queryBuilder"
import AppError from "../../../errors/AppError"
import { paymentHistoryModel, PaymentModel } from "../../basic_modules/payment/payment.model"
import { UserModel } from "../../basic_modules/user/user.model"
import { TProject } from "../addProject/project-interface"
import projectModel from "../addProject/project-model"
import { conversationModel } from "../messages/messages.model"
import { providerFeedbackModel } from "../providerFeedback/providerModel"
import { TBitProject } from "./BitProject.interface"
import BitProjectModel from "./BitProject.model"

const createBitProject = async (payload: TBitProject) => {
    const isProject = await projectModel.findById(payload.projectId)
    if (!isProject) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found ! ')
    }
    const result = await BitProjectModel.create(payload)
    return result
}
const singleProjectDB = async (projectId: string) => {
    const bitProject: any = await BitProjectModel.findById(projectId).populate({
        path: 'providerId',
        select: 'name   _id ',
    }).populate({
        path: 'projectId',
        select: 'projectCategory _id',
    });
    if (!bitProject) {
        throw new AppError(httpStatus.NOT_FOUND, 'This project not found!');
    }
    const allFeedback = await providerFeedbackModel.find({ providerId: bitProject?.providerId._id });
    const totalRating = allFeedback.reduce((acc, feedback) => acc + feedback.rating, 0);
    const averageRating = allFeedback.length > 0 ? totalRating / allFeedback.length : 0;
    const ratingCount = allFeedback.reduce((acc: any, feedback) => {
        acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
        return acc;
    }, {});

    const ratingResponse = {
        providerId: bitProject.providerId._id,
        providerName: bitProject.providerId.name,
        projectType: bitProject.projectId.projectCategory,
        workdetails: bitProject.Workdetails,
        price: bitProject.price,
        serviceTime: bitProject.serviceTime,
        startDate: bitProject.startTime,
        certificate: bitProject.certificate,
        averageRating: averageRating.toFixed(1),
        ratingDistribution: {
            5: ratingCount[5] || 0,
            4: ratingCount[4] || 0,
            3: ratingCount[3] || 0,
            2: ratingCount[2] || 0,
            1: ratingCount[1] || 0,
        },
        totalReviews: allFeedback.length,

    };

    return ratingResponse;
};




const bitProjectApprovedDB = async (bitProjectId: string, email: string) => {
    const bitProject: any = await BitProjectModel.findById(bitProjectId).populate({
        path: "projectId",
        select: "projectName ",
    })
    if (!bitProject) {
        throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    }


    const isbit = await BitProjectModel.findOne({
        projectId: bitProject.projectId._id,
        isComplete: "running"
    })

    if (isbit) {
        throw new AppError(httpStatus.CONFLICT, "Project is already approved");
    }
    if (bitProject?.isComplete === 'running') {
        throw new AppError(httpStatus.CONFLICT, "Project is already approved");
    }

    if (!bitProject) {
        throw new AppError(httpStatus.NOT_FOUND, "bit project not found ")
    }

    const isWallet = await PaymentModel.findOne({ customerEmail: email })
    const project: any = await projectModel.findById(bitProject.projectId._id)

    if (!isWallet) {
        throw new AppError(httpStatus.PAYMENT_REQUIRED, 'Create a wallet account ')
    }
    if (isWallet.amount < bitProject.price) {
        throw new AppError(httpStatus.NOT_EXTENDED, 'Insufficient balance ')
    }
    isWallet.amount -= bitProject.price;
    project.isApprove = true
    bitProject.isComplete = 'running'
    await project.save()
    await bitProject.save()
    await isWallet.save();
    await paymentHistoryModel.create({
        historyName: `${bitProject.projectId.projectName} confirm`,
        balance: bitProject.price,
        email: email,
        paymentType: "withdraw"
    })
    return bitProject

};

const confirmProjectDB = async (projectId: string) => {
    const currentProjects: any = await BitProjectModel.findOne({
        projectId: projectId,
    }).populate({
        path: "projectId",
        select: "userId projectCategory projectName street city postCode image ",
    }).populate({
        path: "providerId",
        select: "name image isActive updatedAt",
    })
    const user = await UserModel.findById(currentProjects.projectId.userId)
    const conversation: any = await conversationModel.findOne({
        projectId: projectId,
        providerId: currentProjects.providerId,
        userId: currentProjects.projectId.userId
    })
    return {
        currentProjects,
        conversationId: conversation._id,
        userName: user.name,
        userImage: user.image,
        isActive: user.isActive,
        updatedAt: user.updatedAt
    }
}






// const currentProjectsDB = async (providerId: string) => {
//     const currentProjects = await BitProjectModel.find({
//         isComplete: 'running',
//         providerId: providerId,
//     }).populate({
//         path: "projectId",
//         select: "projectCategory street postCode image",
//     })
//     return currentProjects
// }
// const pendingsBitsDB = async (providerId: string) => {
//     const pendingsBits = await BitProjectModel.find({
//         isComplete: 'pending',
//         providerId: providerId,
//     }).populate({
//         path: "projectId",
//         select: "projectCategory street postCode image ",
//     })
//     return pendingsBits
// }
const currentProjectsDB = async (providerId: string, query: Record<string, unknown>) => {
    const ProjectsQuery = new queryBuilder(BitProjectModel.find({ isComplete: 'running', providerId: providerId }), query);
    const { totalData } = await ProjectsQuery.paginate(BitProjectModel.find({ isComplete: 'running', providerId: providerId }));

    const currentProjects = await ProjectsQuery.modelQuery.populate({
        path: "projectId",
        select: "projectCategory street postCode image",
    }).exec();

    const currentPage = Number(query?.page) || 1;
    const limit = Number(query.limit) || 10;

    const pagination = ProjectsQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });

    return { pagination, currentProjects };
};

const pendingsBitsDB = async (providerId: string, query: Record<string, unknown>) => {
    const ProjectsQuery = new queryBuilder(BitProjectModel.find({ isComplete: 'pending', providerId: providerId }), query);
    const { totalData } = await ProjectsQuery.paginate(BitProjectModel.find({ isComplete: 'pending', providerId: providerId }));
    const pendingsBits = await ProjectsQuery.modelQuery.populate({
        path: "projectId",
        select: "projectCategory street postCode image",
    }).exec();

    const currentPage = Number(query?.page) || 1;
    const limit = Number(query.limit) || 10;

    const pagination = ProjectsQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });

    return { pagination, pendingsBits };
};







const ProjectOkByProviderDB = async (bitProjectId: string, providerId: string) => {
    const currentProjects = await BitProjectModel.findOne({
        _id: bitProjectId,
        providerId: providerId,
    })
    if (!currentProjects) {
        throw new AppError(httpStatus.NOT_EXTENDED, 'Project Not found ')
    }
    if (currentProjects.isComplete === 'complete') {
        throw new AppError(httpStatus.NOT_EXTENDED, ' Proposal alredy sent ')
    }
    currentProjects.isComplete = 'complete'
    await currentProjects.save()
    return currentProjects
}
const ProjectNotOkDB = async (bitProjectId: string, userId: string) => {
    const currentProjects = await BitProjectModel.findById(bitProjectId);
    if (!currentProjects) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }
    const myProjects = await projectModel.findById(currentProjects.projectId);
    if (!myProjects || myProjects.userId.toString() !== userId) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }
    currentProjects.isComplete = 'running'
    await currentProjects.save()
    return null
}
const ProjectOkByUserDB = async (bitProjectId: string, userId: string,) => {
    const currentProjects = await BitProjectModel.findById(bitProjectId);
    if (!currentProjects) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }
    if (currentProjects.isComplete !== 'complete') {
        throw new AppError(httpStatus.BAD_REQUEST, 'The project was not completed properly.');
    }
    const myProjects = await projectModel.findById(currentProjects.projectId) as TProject;
    if (!myProjects || myProjects.userId.toString() !== userId) {
        throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }

    // Update provider's wallet
    const provider = await UserModel.findById(currentProjects.providerId)
    await PaymentModel.findOneAndUpdate(
        { customerEmail: provider.email },
        {
            $inc: { amount: currentProjects.price },
        },
        { new: true }
    );
    myProjects.isComplete = true;
    await myProjects.save();
};


export const bitProjectService = {
    createBitProject,
    singleProjectDB,
    bitProjectApprovedDB,
    currentProjectsDB,
    pendingsBitsDB,
    ProjectOkByProviderDB,
    ProjectOkByUserDB,
    confirmProjectDB,
    ProjectNotOkDB
}